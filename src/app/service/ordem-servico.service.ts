import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  AGENDAMENTOS_STORAGE_KEY,
  AgendamentoCliente,
  Orcamento,
} from '../models/agendamento-cliente';
import {
  CatalogoServicoOS,
  OrdemServico,
  ServicoOrdem,
  StatusEmpresa,
  StatusServicoOS,
  clientePodeCancelar,
  statusVisivelAoCliente,
} from '../models/ordem-servico';
import { FinanceiroService } from './financeiro.service';

const ORDENS_STORAGE_KEY = 'ordens_servico';
const NOTIFICACOES_STORAGE_KEY = 'notificacoes_oficina';
const IMPOSTO_PADRAO = 0.08;

const CATALOGO_SERVICOS_OS: CatalogoServicoOS[] = [
  { codigo: 'REV-001', nome: 'Revisão preventiva', descricao: 'Inspeção geral de segurança e fluídos.', categoria: 'Revisão', precoUnitario: 180, tempoEstimado: '1h30' },
  { codigo: 'REV-002', nome: 'Troca de óleo', descricao: 'Substituição de óleo e filtro.', categoria: 'Revisão', precoUnitario: 220, tempoEstimado: '45min' },
  { codigo: 'MOT-001', nome: 'Diagnóstico do motor', descricao: 'Leitura técnica e análise de falhas.', categoria: 'Motor', precoUnitario: 160, tempoEstimado: '1h' },
  { codigo: 'MOT-002', nome: 'Limpeza de bicos', descricao: 'Limpeza e equalização dos injetores.', categoria: 'Motor', precoUnitario: 280, tempoEstimado: '2h' },
  { codigo: 'FRE-001', nome: 'Troca de pastilhas', descricao: 'Substituição das pastilhas dianteiras.', categoria: 'Freios', precoUnitario: 260, tempoEstimado: '1h20' },
  { codigo: 'FRE-002', nome: 'Sangria do freio', descricao: 'Troca parcial do fluído e sangria.', categoria: 'Freios', precoUnitario: 140, tempoEstimado: '50min' },
  { codigo: 'SUS-001', nome: 'Alinhamento', descricao: 'Ajuste de geometria da direção.', categoria: 'Suspensão', precoUnitario: 120, tempoEstimado: '40min' },
  { codigo: 'SUS-002', nome: 'Balanceamento', descricao: 'Balanceamento das quatro rodas.', categoria: 'Suspensão', precoUnitario: 100, tempoEstimado: '35min' },
  { codigo: 'ELE-001', nome: 'Teste de bateria', descricao: 'Medição de carga e alternador.', categoria: 'Elétrica', precoUnitario: 60, tempoEstimado: '20min' },
  { codigo: 'ELE-002', nome: 'Troca de lâmpadas', descricao: 'Substituição e teste de iluminação.', categoria: 'Elétrica', precoUnitario: 80, tempoEstimado: '30min' },
  { codigo: 'PNE-001', nome: 'Rodízio de pneus', descricao: 'Rodízio e calibração completa.', categoria: 'Pneus', precoUnitario: 90, tempoEstimado: '30min' },
  { codigo: 'ARC-001', nome: 'Higienização do ar', descricao: 'Limpeza do sistema e troca do filtro.', categoria: 'Ar-condicionado', precoUnitario: 190, tempoEstimado: '1h' },
  { codigo: 'DIA-001', nome: 'Scanner eletrônico', descricao: 'Leitura de módulos eletrônicos.', categoria: 'Diagnóstico', precoUnitario: 130, tempoEstimado: '40min' },
];

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private readonly agendamentosSubject = new BehaviorSubject<AgendamentoCliente[]>(
    this.carregarAgendamentos(),
  );
  private readonly ordensSubject = new BehaviorSubject<OrdemServico[]>(
    this.carregarOrdens(),
  );

  readonly agendamentos$ = this.agendamentosSubject.asObservable();
  readonly ordens$ = this.ordensSubject.asObservable();

  constructor(private readonly financeiroService: FinanceiroService) {
    this.sincronizarSolicitacoes();
    this.ordensSubject.value.forEach(ordem =>
      this.financeiroService.sincronizarOrdemServico(ordem),
    );
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === AGENDAMENTOS_STORAGE_KEY) {
          this.agendamentosSubject.next(this.carregarAgendamentos());
        }
        if (event.key === ORDENS_STORAGE_KEY) {
          this.ordensSubject.next(this.carregarOrdens());
        }
      });
    }
  }

  listarAgendamentos(): AgendamentoCliente[] {
    return this.agendamentosSubject.value;
  }

  listarOrdens(): OrdemServico[] {
    return this.ordensSubject.value;
  }

  listarCatalogoServicos(): CatalogoServicoOS[] {
    return CATALOGO_SERVICOS_OS;
  }

  buscarOrdemPorId(id: number): OrdemServico | undefined {
    const ordem = this.ordensSubject.value.find(item => item.id === id);
    return ordem ? this.garantirServicosCatalogo(ordem) : undefined;
  }

  confirmarEscolhaServicos(
    ordemId: number,
    codigos: string[],
    modo: 'cliente' | 'atendente',
    usuario: string,
  ): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }

    const agora = new Date().toISOString();
    const status: StatusServicoOS = modo === 'cliente' ? 'aprovado' : 'aguardando aprovação';

    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico =>
        codigos.includes(servico.codigo)
          ? {
              ...servico,
              selecionado: true,
              status,
              aprovadoEm: modo === 'cliente' ? agora : servico.aprovadoEm,
              aprovadoPor: modo === 'cliente' ? usuario : servico.aprovadoPor,
              atualizadoEm: agora,
            }
          : servico,
      ),
      atualizadoEm: agora,
    };

    atualizada.valorTotal = this.calcularTotalServicos(atualizada.servicosCatalogo || []);
    this.registrarAuditoria(
      atualizada,
      usuario,
      modo === 'cliente' ? 'aprovou serviços' : 'enviou proposta ao cliente',
      `${codigos.length} serviço(s): ${codigos.join(', ')}`,
    );
    if (modo === 'cliente') {
      this.notificarOficina(
        atualizada,
        'Cliente aprovou serviços',
        `Serviços aprovados na ${atualizada.numero}: ${codigos.join(', ')}. E-mail marcado para envio.`,
      );
    }
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  responderPropostaServico(
    ordemId: number,
    codigo: string,
    aprovado: boolean,
    usuario: string,
  ): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }

    const agora = new Date().toISOString();
    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico =>
        servico.codigo === codigo && servico.status === 'aguardando aprovação'
          ? {
              ...servico,
              status: aprovado ? 'aprovado' : 'pendente',
              selecionado: aprovado,
              aprovadoEm: aprovado ? agora : undefined,
              aprovadoPor: aprovado ? usuario : undefined,
              atualizadoEm: agora,
            }
          : servico,
      ),
      atualizadoEm: agora,
    };

    atualizada.valorTotal = this.calcularTotalServicos(atualizada.servicosCatalogo || []);
    this.registrarAuditoria(
      atualizada,
      usuario,
      aprovado ? 'aprovou proposta' : 'recusou proposta',
      codigo,
    );
    if (aprovado) {
      this.notificarOficina(
        atualizada,
        'Cliente aprovou proposta',
        `Proposta aprovada para ${codigo} na ${atualizada.numero}. E-mail marcado para envio.`,
      );
    }
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  aplicarDescontoServico(
    ordemId: number,
    codigo: string,
    descontoTipo: 'percentual' | 'valor',
    descontoValor: number,
    justificativa: string,
    usuario: string,
  ): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }
    const servicoAtual = this.servicosDaOrdem(ordem).find(servico => servico.codigo === codigo);
    const descontoExigeJustificativa =
      descontoTipo === 'percentual'
        ? descontoValor > 10
        : descontoValor > ((servicoAtual?.precoUnitario || 0) * 0.1);
    if (descontoExigeJustificativa && !justificativa.trim()) {
      return undefined;
    }

    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico =>
        servico.codigo === codigo
          ? {
              ...servico,
              descontoTipo,
              descontoValor,
              descontoJustificativa: justificativa,
              atualizadoEm: new Date().toISOString(),
            }
          : servico,
      ),
      atualizadoEm: new Date().toISOString(),
    };

    atualizada.valorTotal = this.calcularTotalServicos(atualizada.servicosCatalogo || []);
    this.registrarAuditoria(atualizada, usuario, 'aplicou desconto', `${codigo}: ${descontoValor}`);
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  atualizarObservacaoServico(
    ordemId: number,
    codigo: string,
    observacao: string,
    usuario: string,
  ): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }

    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico =>
        servico.codigo === codigo
          ? { ...servico, observacao, atualizadoEm: new Date().toISOString() }
          : servico,
      ),
      atualizadoEm: new Date().toISOString(),
    };
    this.registrarAuditoria(atualizada, usuario, 'editou observação', codigo);
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  alterarStatusServico(
    ordemId: number,
    codigo: string,
    novoStatus: StatusServicoOS,
    usuario: string,
  ): { ordem?: OrdemServico; erro?: string } {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return { erro: 'OS não encontrada.' };
    }

    const servicoAtual = this.servicosDaOrdem(ordem).find(servico => servico.codigo === codigo);
    if (!servicoAtual) {
      return { erro: 'Serviço não encontrado.' };
    }

    if (!this.transicaoValida(servicoAtual.status, novoStatus)) {
      return { erro: `Transição inválida: ${servicoAtual.status} → ${novoStatus}.` };
    }

    const agora = new Date().toISOString();
    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico =>
        servico.codigo === codigo
          ? {
              ...servico,
              status: novoStatus,
              tecnicoResponsavel: usuario,
              inicioEm: novoStatus === 'em execução' ? agora : servico.inicioEm,
              fimEm: novoStatus === 'concluído' ? agora : servico.fimEm,
              atualizadoEm: agora,
            }
          : servico,
      ),
      atualizadoEm: agora,
    };

    this.registrarAuditoria(atualizada, usuario, 'alterou status do serviço', `${codigo}: ${novoStatus}`);
    this.finalizarOrdemSeCompleta(atualizada, usuario);
    this.salvarOrdem(atualizada);
    return { ordem: atualizada };
  }

  moverServicoChecklist(ordemId: number, codigo: string, direcao: -1 | 1, usuario: string): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }

    const servicos = this.servicosDaOrdem(ordem).slice().sort((a, b) => a.ordem - b.ordem);
    const index = servicos.findIndex(servico => servico.codigo === codigo);
    const novoIndex = index + direcao;
    if (index < 0 || novoIndex < 0 || novoIndex >= servicos.length) {
      return ordem;
    }

    [servicos[index], servicos[novoIndex]] = [servicos[novoIndex], servicos[index]];
    const reordenados = servicos.map((servico, ordemItem) => ({ ...servico, ordem: ordemItem + 1 }));
    const atualizada = { ...ordem, servicosCatalogo: reordenados, atualizadoEm: new Date().toISOString() };
    this.registrarAuditoria(atualizada, usuario, 'reordenou checklist', codigo);
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  reordenarServicosChecklist(ordemId: number, codigosOrdenados: string[], usuario: string): OrdemServico | undefined {
    const ordem = this.buscarOrdemPorId(ordemId);
    if (!ordem) {
      return undefined;
    }

    const posicoes = new Map(codigosOrdenados.map((codigo, index) => [codigo, index + 1]));
    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: this.servicosDaOrdem(ordem).map(servico => ({
        ...servico,
        ordem: posicoes.get(servico.codigo) || servico.ordem,
      })),
      atualizadoEm: new Date().toISOString(),
    };
    this.registrarAuditoria(atualizada, usuario, 'reordenou checklist por arraste', codigosOrdenados.join(', '));
    this.salvarOrdem(atualizada);
    return atualizada;
  }

  podeCancelarAgendamento(agendamentoId: number): boolean {
    const ordem = this.ordensSubject.value.find(
      item => item.agendamentoId === agendamentoId,
    );
    return ordem ? clientePodeCancelar(ordem.status) : true;
  }

  criarAgendamento(agendamento: AgendamentoCliente): void {
    this.salvarAgendamentos([agendamento, ...this.agendamentosSubject.value]);
    this.sincronizarSolicitacoes();
  }

  sincronizarSolicitacoes(): void {
    const agendamentos = [...this.agendamentosSubject.value];
    const ordens = [...this.ordensSubject.value];
    let alterou = false;

    for (const agendamento of agendamentos) {
      const existente = ordens.find(
        ordem =>
          ordem.id === agendamento.ordemServicoId ||
          ordem.agendamentoId === agendamento.id,
      );

      if (existente) {
        const statusAnterior = agendamento.status;
        const ordemAnterior = agendamento.ordemServicoId;
        this.sincronizarStatusCliente(agendamento, existente);
        alterou ||= statusAnterior !== agendamento.status || ordemAnterior !== agendamento.ordemServicoId;
        continue;
      }

      if (agendamento.status === 'Cancelado') {
        continue;
      }

      const agora = new Date().toISOString();
      const ordem: OrdemServico = {
        id: Date.now() + agendamento.id,
        numero: this.proximoNumeroOS(ordens),
        cliente: agendamento.cliente,
        veiculo: agendamento.automovel,
        placa: agendamento.placa,
        dataAbertura: agora,
        dataPrevisao: this.criarDataLocal(agendamento.data),
        status: 'Aguardando Orçamento',
        prioridade: 'Média',
        servicos: [agendamento.servico],
        valorTotal: 0,
        observacoes: agendamento.observacao,
        agendamentoId: agendamento.id,
        atualizadoEm: agora,
      };

      ordens.unshift(ordem);
      agendamento.ordemServicoId = ordem.id;
      agendamento.ordemServicoNumero = ordem.numero;
      this.sincronizarStatusCliente(agendamento, ordem);
      alterou = true;
    }

    if (alterou) {
      this.salvarOrdens(ordens);
      this.salvarAgendamentos(agendamentos);
    }
  }

  salvarOrdem(ordem: OrdemServico): void {
    const ordens = [...this.ordensSubject.value];
    const index = ordens.findIndex(item => item.id === ordem.id);
    const atualizada = { ...ordem, atualizadoEm: new Date().toISOString() };

    if (index >= 0) {
      ordens[index] = atualizada;
    } else {
      ordens.unshift(atualizada);
    }

    this.salvarOrdens(ordens);
    this.refletirOrdemNoCliente(atualizada);
    this.financeiroService.sincronizarOrdemServico(atualizada);
  }

  atualizarStatus(id: number, status: StatusEmpresa): void {
    const ordem = this.ordensSubject.value.find(item => item.id === id);
    if (!ordem) {
      return;
    }

    if (status === 'Orçamento em Execução' && ordem.agendamentoId) {
      const agendamentos = [...this.agendamentosSubject.value];
      const agendamento = agendamentos.find(item => item.id === ordem.agendamentoId);
      if (agendamento?.orcamento?.status === 'Recusado') {
        agendamento.orcamento = undefined;
        this.salvarAgendamentos(agendamentos);
      }
    }

    this.salvarOrdem({ ...ordem, status });
  }

  enviarOrcamento(id: number): void {
    const ordem = this.ordensSubject.value.find(item => item.id === id);
    if (!ordem?.agendamentoId) {
      return;
    }

    const agendamentos = [...this.agendamentosSubject.value];
    const agendamento = agendamentos.find(item => item.id === ordem.agendamentoId);
    if (!agendamento) {
      return;
    }

    agendamento.orcamento = {
      descricao: ordem.servicos.join(', '),
      valor: ordem.valorTotal,
      observacao: ordem.observacoes,
      status: 'Aguardando aprovação',
      enviadoEm: new Date().toISOString(),
    };
    agendamento.atualizadoEm = new Date().toISOString();
    this.salvarAgendamentos(agendamentos);
    this.atualizarStatus(id, 'Aguardando Aprovação');
  }

  responderOrcamento(
    agendamentoId: number,
    aprovado: boolean,
  ): void {
    const agendamentos = [...this.agendamentosSubject.value];
    const agendamento = agendamentos.find(item => item.id === agendamentoId);
    const ordem = this.ordensSubject.value.find(
      item => item.agendamentoId === agendamentoId,
    );

    if (!agendamento?.orcamento || !ordem || ordem.status !== 'Aguardando Aprovação') {
      return;
    }

    agendamento.orcamento = {
      ...agendamento.orcamento,
      status: aprovado ? 'Aprovado' : 'Recusado',
      respondidoEm: new Date().toISOString(),
    };
    agendamento.atualizadoEm = new Date().toISOString();
    this.salvarAgendamentos(agendamentos);
    this.atualizarStatus(
      ordem.id,
      aprovado ? 'Aguardando Execução' : 'Aguardando Orçamento',
    );
  }

  cancelarPeloCliente(agendamentoId: number): boolean {
    const ordem = this.ordensSubject.value.find(
      item => item.agendamentoId === agendamentoId,
    );

    if (ordem && !clientePodeCancelar(ordem.status)) {
      return false;
    }

    if (ordem) {
      this.atualizarStatus(ordem.id, 'Cancelado');
      return true;
    }

    const agendamentos = [...this.agendamentosSubject.value];
    const agendamento = agendamentos.find(item => item.id === agendamentoId);
    if (!agendamento) {
      return false;
    }

    agendamento.status = 'Cancelado';
    agendamento.atualizadoEm = new Date().toISOString();
    this.salvarAgendamentos(agendamentos);
    return true;
  }

  excluirOrdem(id: number): void {
    const ordem = this.ordensSubject.value.find(item => item.id === id);
    if (ordem?.agendamentoId) {
      this.atualizarStatus(id, 'Cancelado');
      return;
    }
    this.salvarOrdens(this.ordensSubject.value.filter(item => item.id !== id));
  }

  private refletirOrdemNoCliente(ordem: OrdemServico): void {
    if (!ordem.agendamentoId) {
      return;
    }

    const agendamentos = [...this.agendamentosSubject.value];
    const agendamento = agendamentos.find(item => item.id === ordem.agendamentoId);
    if (!agendamento) {
      return;
    }

    this.sincronizarStatusCliente(agendamento, ordem);
    this.salvarAgendamentos(agendamentos);
  }

  private sincronizarStatusCliente(
    agendamento: AgendamentoCliente,
    ordem: OrdemServico,
  ): void {
    agendamento.status = statusVisivelAoCliente(ordem, agendamento);
    agendamento.ordemServicoId = ordem.id;
    agendamento.ordemServicoNumero = ordem.numero;
    agendamento.atualizadoEm = ordem.atualizadoEm;
  }

  private salvarAgendamentos(agendamentos: AgendamentoCliente[]): void {
    this.agendamentosSubject.next(agendamentos);
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(agendamentos));
  }

  private salvarOrdens(ordens: OrdemServico[]): void {
    this.ordensSubject.next(ordens);
    localStorage.setItem(ORDENS_STORAGE_KEY, JSON.stringify(ordens));
  }

  private carregarAgendamentos(): AgendamentoCliente[] {
    return this.lerStorage<AgendamentoCliente[]>(AGENDAMENTOS_STORAGE_KEY, []).map(
      item => ({
        ...item,
        status: this.normalizarStatusCliente(item.status as string),
        orcamento: item.orcamento ? this.normalizarOrcamento(item.orcamento as Orcamento) : undefined,
      }),
    );
  }

  private carregarOrdens(): OrdemServico[] {
    return this.lerStorage<any[]>(ORDENS_STORAGE_KEY, []).map(item => ({
      ...item,
      dataAbertura: this.normalizarData(item.dataAbertura),
      dataPrevisao: this.normalizarData(item.dataPrevisao),
      status: this.normalizarStatusEmpresa(item.status),
      servicosCatalogo: item.servicosCatalogo?.length ? item.servicosCatalogo : undefined,
      auditoria: item.auditoria || [],
      atualizadoEm: item.atualizadoEm || new Date().toISOString(),
    }));
  }

  private normalizarStatusCliente(status: string): AgendamentoCliente['status'] {
    const legado: Record<string, AgendamentoCliente['status']> = {
      Aberta: 'Aguardando Orçamento',
      'Em Andamento': 'Em Execução',
      'Aguardando Peças': 'Em Execução',
      Concluída: 'Finalizado',
      Cancelada: 'Cancelado',
    };
    return legado[status] || (status as AgendamentoCliente['status']);
  }

  private normalizarStatusEmpresa(status: string): StatusEmpresa {
    const legado: Record<string, StatusEmpresa> = {
      Aberta: 'Aguardando Orçamento',
      'Em Andamento': 'Em Execução',
      'Aguardando Peças': 'Em Execução',
      Concluída: 'Finalizado',
      Cancelada: 'Cancelado',
    };
    return legado[status] || status || 'Aguardando Orçamento';
  }

  private garantirServicosCatalogo(ordem: OrdemServico): OrdemServico {
    if (ordem.servicosCatalogo?.length) {
      return ordem;
    }

    const atualizada: OrdemServico = {
      ...ordem,
      servicosCatalogo: CATALOGO_SERVICOS_OS.map((servico, index) => ({
        ...servico,
        selecionado: false,
        status: 'pendente',
        ordem: index + 1,
        anexos: [],
      })),
      auditoria: ordem.auditoria || [],
    };

    this.salvarOrdem(atualizada);
    return atualizada;
  }

  private servicosDaOrdem(ordem: OrdemServico): ServicoOrdem[] {
    return ordem.servicosCatalogo?.length
      ? ordem.servicosCatalogo
      : CATALOGO_SERVICOS_OS.map((servico, index) => ({
          ...servico,
          selecionado: false,
          status: 'pendente',
          ordem: index + 1,
          anexos: [],
        }));
  }

  private transicaoValida(atual: StatusServicoOS, proximo: StatusServicoOS): boolean {
    const transicoes: Record<StatusServicoOS, StatusServicoOS[]> = {
      pendente: ['aguardando aprovação', 'aprovado'],
      'aguardando aprovação': ['aprovado', 'pendente'],
      aprovado: ['em execução'],
      'em execução': ['concluído'],
      concluído: [],
    };
    return transicoes[atual].includes(proximo);
  }

  private finalizarOrdemSeCompleta(ordem: OrdemServico, responsavel: string): void {
    const aprovados = this.servicosDaOrdem(ordem).filter(servico =>
      ['aprovado', 'em execução', 'concluído'].includes(servico.status),
    );
    if (!aprovados.length || !aprovados.every(servico => servico.status === 'concluído')) {
      return;
    }

    ordem.status = 'Finalizado';
    ordem.entrega = {
      dataHora: new Date().toISOString(),
      responsavel,
    };
    this.registrarAuditoria(ordem, responsavel, 'gerou entrega', 'Todos os serviços aprovados foram concluídos.');
  }

  private registrarAuditoria(
    ordem: OrdemServico,
    usuario: string,
    acao: string,
    detalhe: string,
  ): void {
    ordem.auditoria = [
      {
        id: `${Date.now()}-${Math.random()}`,
        usuario,
        timestamp: new Date().toISOString(),
        acao,
        detalhe,
      },
      ...(ordem.auditoria || []),
    ];
  }

  private notificarOficina(ordem: OrdemServico, titulo: string, mensagem: string): void {
    const notificacoes = this.lerStorage<any[]>(NOTIFICACOES_STORAGE_KEY, []);
    const notificacao = {
      id: `${Date.now()}-${Math.random()}`,
      osId: ordem.id,
      osNumero: ordem.numero,
      titulo,
      mensagem,
      canal: 'in-app + e-mail',
      lida: false,
      criadaEm: new Date().toISOString(),
    };
    localStorage.setItem(NOTIFICACOES_STORAGE_KEY, JSON.stringify([notificacao, ...notificacoes]));
    this.registrarAuditoria(ordem, 'Sistema', 'notificou oficina', mensagem);
  }

  private calcularTotalServicos(servicos: ServicoOrdem[]): number {
    const subtotal = servicos
      .filter(servico => servico.selecionado)
      .reduce((total, servico) => total + this.valorServicoComDesconto(servico), 0);
    return subtotal + subtotal * IMPOSTO_PADRAO;
  }

  private valorServicoComDesconto(servico: ServicoOrdem): number {
    const desconto = servico.descontoTipo === 'percentual'
      ? servico.precoUnitario * ((servico.descontoValor || 0) / 100)
      : servico.descontoValor || 0;
    return Math.max(servico.precoUnitario - desconto, 0);
  }

  private normalizarOrcamento(orcamento: Orcamento): Orcamento {
    const legado: Record<string, Orcamento['status']> = {
      pendente: 'Aguardando aprovação',
      aprovado: 'Aprovado',
      reprovado: 'Recusado',
    };

    return {
      ...orcamento,
      status: legado[orcamento.status] || orcamento.status,
    };
  }

  private lerStorage<T>(chave: string, padrao: T): T {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? (JSON.parse(valor) as T) : padrao;
    } catch {
      return padrao;
    }
  }

  private proximoNumeroOS(ordens: OrdemServico[]): string {
    const maiorNumero = ordens.reduce((maior, ordem) => {
      const numero = Number(ordem.numero?.replace(/\D/g, ''));
      return Math.max(maior, Number.isNaN(numero) ? 0 : numero);
    }, 0);
    return `OS-${String(maiorNumero + 1).padStart(3, '0')}`;
  }

  private criarDataLocal(data: string): string {
    return data ? new Date(`${data}T12:00:00`).toISOString() : new Date().toISOString();
  }

  private normalizarData(data: string | Date): string {
    return data ? new Date(data).toISOString() : new Date().toISOString();
  }
}
