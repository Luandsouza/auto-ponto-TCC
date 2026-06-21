import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  AtualizacaoLancamentoFinanceiro,
  LancamentoFinanceiro,
  NovoLancamentoFinanceiro,
  ResumoFinanceiro,
  TipoLancamentoFinanceiro,
} from '../models/financeiro';
import { FiltroPeriodo } from '../models/relatorio';
import { OrdemServico } from '../models/ordem-servico';
import { Servico } from '../models/servico';

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private readonly storageKey = 'auto-ponto-lancamentos-financeiros';
  private readonly lancamentosSubject = new BehaviorSubject<LancamentoFinanceiro[]>(
    this.carregar(),
  );

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === this.storageKey) {
          this.lancamentosSubject.next(this.carregar());
        }
      });
    }
  }

  listar(): Observable<LancamentoFinanceiro[]> {
    return this.lancamentosSubject.asObservable();
  }

  listarAtual(): LancamentoFinanceiro[] {
    return this.lancamentosSubject.value;
  }

  buscarPorId(id: string): LancamentoFinanceiro | undefined {
    return this.lancamentosSubject.value.find((lancamento) => lancamento.id === id);
  }

  filtrarPorTipo(tipo: TipoLancamentoFinanceiro): LancamentoFinanceiro[] {
    return this.lancamentosSubject.value.filter((lancamento) => lancamento.tipo === tipo);
  }

  filtrarPorPeriodo(periodo: FiltroPeriodo): LancamentoFinanceiro[] {
    return this.lancamentosSubject.value.filter((lancamento) =>
      this.estaNoPeriodo(lancamento.dataVencimento, periodo),
    );
  }

  criar(lancamento: NovoLancamentoFinanceiro): LancamentoFinanceiro {
    const agora = new Date().toISOString();
    const novoLancamento: LancamentoFinanceiro = {
      ...lancamento,
      valor: this.normalizarValor(lancamento.valor),
      origem: lancamento.origem || 'manual',
      id: this.gerarId(),
      dataCadastro: agora,
      dataAtualizacao: agora,
    };

    this.atualizarLista([...this.lancamentosSubject.value, novoLancamento]);
    return novoLancamento;
  }

  atualizar(
    id: string,
    alteracoes: AtualizacaoLancamentoFinanceiro,
  ): LancamentoFinanceiro | undefined {
    const lancamentoAtual = this.buscarPorId(id);

    if (!lancamentoAtual) {
      return undefined;
    }

    const lancamentoAtualizado: LancamentoFinanceiro = {
      ...lancamentoAtual,
      ...alteracoes,
      valor: this.normalizarValor(alteracoes.valor ?? lancamentoAtual.valor),
      dataPagamento:
        alteracoes.status && alteracoes.status !== 'pago'
          ? undefined
          : alteracoes.dataPagamento ?? lancamentoAtual.dataPagamento,
      dataAtualizacao: new Date().toISOString(),
    };

    this.atualizarLista(
      this.lancamentosSubject.value.map((lancamento) =>
        lancamento.id === id ? lancamentoAtualizado : lancamento,
      ),
    );

    return lancamentoAtualizado;
  }

  marcarComoPago(
    id: string,
    dataPagamento = new Date().toISOString(),
  ): LancamentoFinanceiro | undefined {
    return this.atualizar(id, {
      status: 'pago',
      dataPagamento,
    });
  }

  remover(id: string): void {
    this.atualizarLista(this.lancamentosSubject.value.filter((lancamento) => lancamento.id !== id));
  }

  gerarResumo(periodo: FiltroPeriodo = {}): ResumoFinanceiro {
    return this.gerarResumoDosLancamentos(this.filtrarPorPeriodo(periodo));
  }

  gerarResumoDosLancamentos(lancamentos: LancamentoFinanceiro[]): ResumoFinanceiro {

    const totalReceitas = this.somar(lancamentos, 'receita');
    const totalDespesas = this.somar(lancamentos, 'despesa');
    const pagos = lancamentos.filter((lancamento) => lancamento.status === 'pago');
    const pendentes = lancamentos.filter((lancamento) => lancamento.status === 'pendente');
    const totalReceitasPagas = this.somar(pagos, 'receita');
    const totalDespesasPagas = this.somar(pagos, 'despesa');

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      totalReceitasPagas,
      totalDespesasPagas,
      saldoRealizado: totalReceitasPagas - totalDespesasPagas,
      pendenteReceber: this.somar(pendentes, 'receita'),
      pendentePagar: this.somar(pendentes, 'despesa'),
    };
  }

  sincronizarServico(servico: Servico): LancamentoFinanceiro | undefined {
    const vinculados = this.lancamentosSubject.value.filter(
      lancamento => lancamento.servicoId === servico.id,
    );
    const existente = vinculados[0];
    vinculados.slice(1).forEach(lancamento => this.remover(lancamento.id));
    const statusGeraReceita = [
      'aprovado',
      'em_andamento',
      'aguardando_peca',
      'concluido',
    ].includes(servico.status);

    if (!statusGeraReceita) {
      return existente
        ? this.atualizar(existente.id, {
            status: 'cancelado',
            dataPagamento: undefined,
          })
        : undefined;
    }

    const dados: NovoLancamentoFinanceiro = {
      tipo: 'receita',
      categoria: 'servico',
      descricao: `Serviço - ${servico.titulo}`,
      valor: servico.total,
      status:
        servico.status === 'cancelado'
          ? 'cancelado'
          : servico.status === 'concluido'
            ? 'pago'
            : 'pendente',
      dataVencimento: servico.dataConclusao || servico.dataPrevisao || servico.dataAbertura,
      dataPagamento:
        servico.status === 'concluido'
          ? servico.dataConclusao || new Date().toISOString()
          : undefined,
      servicoId: servico.id,
      origem: 'servico',
      observacoes: 'Receita sincronizada automaticamente com o serviço.',
    };

    return existente
      ? (this.atualizar(existente.id, dados) as LancamentoFinanceiro)
      : this.criar(dados);
  }

  sincronizarOrdemServico(ordem: OrdemServico): LancamentoFinanceiro | undefined {
    const vinculados = this.lancamentosSubject.value.filter(
      lancamento => lancamento.ordemServicoId === ordem.id,
    );
    const existente = vinculados[0];
    vinculados.slice(1).forEach(lancamento => this.remover(lancamento.id));
    const statusGeraReceita = ['Aguardando Execução', 'Em Execução', 'Finalizado'].includes(
      ordem.status,
    );

    if (!statusGeraReceita) {
      return existente
        ? this.atualizar(existente.id, {
            status: 'cancelado',
            dataPagamento: undefined,
          })
        : undefined;
    }

    const dados: NovoLancamentoFinanceiro = {
      tipo: 'receita',
      categoria: 'servico',
      descricao: `${ordem.numero} - ${ordem.servicos.join(', ') || ordem.veiculo}`,
      valor: ordem.valorTotal,
      status: ordem.status === 'Cancelado' ? 'cancelado' : existente?.status === 'pago' ? 'pago' : 'pendente',
      dataVencimento: ordem.dataPrevisao || ordem.dataAbertura,
      dataPagamento: existente?.status === 'pago' ? existente.dataPagamento : undefined,
      ordemServicoId: ordem.id,
      origem: 'ordem_servico',
      observacoes: `Receita sincronizada automaticamente com ${ordem.numero}.`,
    };

    return existente
      ? (this.atualizar(existente.id, dados) as LancamentoFinanceiro)
      : this.criar(dados);
  }

  private somar(lancamentos: LancamentoFinanceiro[], tipo: TipoLancamentoFinanceiro): number {
    return lancamentos
      .filter((lancamento) => lancamento.tipo === tipo && lancamento.status !== 'cancelado')
      .reduce((total, lancamento) => total + lancamento.valor, 0);
  }

  private estaNoPeriodo(data: string, periodo: FiltroPeriodo): boolean {
    const timestamp = new Date(data).getTime();
    const dataInicial = periodo.dataInicial
      ? new Date(`${periodo.dataInicial.slice(0, 10)}T00:00:00`).getTime()
      : undefined;
    const dataFinal = periodo.dataFinal
      ? new Date(`${periodo.dataFinal.slice(0, 10)}T23:59:59.999`).getTime()
      : undefined;

    if (dataInicial !== undefined && timestamp < dataInicial) {
      return false;
    }

    if (dataFinal !== undefined && timestamp > dataFinal) {
      return false;
    }

    return true;
  }

  private atualizarLista(lancamentos: LancamentoFinanceiro[]): void {
    this.lancamentosSubject.next(lancamentos);
    this.salvar(lancamentos);
  }

  private carregar(): LancamentoFinanceiro[] {
    if (!this.temLocalStorage()) {
      return [];
    }

    const dados = localStorage.getItem(this.storageKey);

    if (!dados) {
      return [];
    }

    try {
      return (JSON.parse(dados) as LancamentoFinanceiro[]).map(lancamento => ({
        ...lancamento,
        valor: this.normalizarValor(lancamento.valor),
        origem:
          lancamento.origem ||
          (lancamento.ordemServicoId
            ? 'ordem_servico'
            : lancamento.servicoId
              ? 'servico'
              : 'manual'),
      }));
    } catch {
      return [];
    }
  }

  private salvar(lancamentos: LancamentoFinanceiro[]): void {
    if (this.temLocalStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(lancamentos));
    }
  }

  private temLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private gerarId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }

  private normalizarValor(valor: number): number {
    const numero = Number(valor);
    return Number.isFinite(numero) ? Math.max(numero, 0) : 0;
  }
}
