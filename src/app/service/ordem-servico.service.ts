import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  AGENDAMENTOS_STORAGE_KEY,
  AgendamentoCliente,
} from '../models/agendamento-cliente';
import {
  OrdemServico,
  StatusEmpresa,
  clientePodeCancelar,
  statusVisivelAoCliente,
} from '../models/ordem-servico';
import { FinanceiroService } from './financeiro.service';

const ORDENS_STORAGE_KEY = 'ordens_servico';

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
      if (agendamento?.orcamento?.status === 'reprovado') {
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
      status: 'pendente',
      enviadoEm: new Date().toISOString(),
    };
    this.salvarAgendamentos(agendamentos);
    this.atualizarStatus(id, 'Aguardando Aprovação');
  }

  responderOrcamento(
    agendamentoId: number,
    resposta: 'aprovado' | 'reprovado',
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
      status: resposta,
      respondidoEm: new Date().toISOString(),
    };
    this.salvarAgendamentos(agendamentos);
    this.atualizarStatus(
      ordem.id,
      resposta === 'aprovado' ? 'Aguardando Execução' : 'Aguardando Orçamento',
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
      }),
    );
  }

  private carregarOrdens(): OrdemServico[] {
    return this.lerStorage<any[]>(ORDENS_STORAGE_KEY, []).map(item => ({
      ...item,
      dataAbertura: this.normalizarData(item.dataAbertura),
      dataPrevisao: this.normalizarData(item.dataPrevisao),
      status: this.normalizarStatusEmpresa(item.status),
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
