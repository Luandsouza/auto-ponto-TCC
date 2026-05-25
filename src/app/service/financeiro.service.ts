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

@Injectable({
  providedIn: 'root',
})
export class FinanceiroService {
  private readonly storageKey = 'auto-ponto-lancamentos-financeiros';
  private readonly lancamentosSubject = new BehaviorSubject<LancamentoFinanceiro[]>(
    this.carregar(),
  );

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
    const lancamentos = this.filtrarPorPeriodo(periodo);

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

  private somar(lancamentos: LancamentoFinanceiro[], tipo: TipoLancamentoFinanceiro): number {
    return lancamentos
      .filter((lancamento) => lancamento.tipo === tipo && lancamento.status !== 'cancelado')
      .reduce((total, lancamento) => total + lancamento.valor, 0);
  }

  private estaNoPeriodo(data: string, periodo: FiltroPeriodo): boolean {
    const timestamp = new Date(data).getTime();
    const dataInicial = periodo.dataInicial ? new Date(periodo.dataInicial).getTime() : undefined;
    const dataFinal = periodo.dataFinal ? new Date(periodo.dataFinal).getTime() : undefined;

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
      return JSON.parse(dados) as LancamentoFinanceiro[];
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
}
