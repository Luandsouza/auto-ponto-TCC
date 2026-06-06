import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CategoriaFinanceira,
  LancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  TipoLancamentoFinanceiro,
} from '../../../models/financeiro';
import { FinanceiroService } from '../../../service/financeiro.service';

@Component({
  selector: 'app-financeiro',
  imports: [CommonModule, FormsModule],
  templateUrl: './financeiro.html',
  styleUrl: './financeiro.css',
})
export class Financeiro {
  filtroTipo = 'todos';
  filtroStatus = 'todos';
  dataInicial = '';
  dataFinal = '';
  editandoId = '';

  tipos: TipoLancamentoFinanceiro[] = ['receita', 'despesa'];
  statusDisponiveis: StatusLancamentoFinanceiro[] = ['pendente', 'pago', 'cancelado'];
  categorias: CategoriaFinanceira[] = [
    'servico',
    'peca',
    'salario',
    'fornecedor',
    'imposto',
    'aluguel',
    'outros',
  ];

  formulario = this.criarFormularioPadrao();

  constructor(private readonly financeiroService: FinanceiroService) {}

  get lancamentos(): LancamentoFinanceiro[] {
    return this.financeiroService
      .filtrarPorPeriodo({ dataInicial: this.dataInicial || undefined, dataFinal: this.dataFinal || undefined })
      .filter((lancamento) => this.filtroTipo === 'todos' || lancamento.tipo === this.filtroTipo)
      .filter((lancamento) => this.filtroStatus === 'todos' || lancamento.status === this.filtroStatus)
      .slice()
      .reverse();
  }

  get resumo() {
    return this.financeiroService.gerarResumo({
      dataInicial: this.dataInicial || undefined,
      dataFinal: this.dataFinal || undefined,
    });
  }

  get maiorValorGrafico(): number {
    return Math.max(
      this.resumo.totalReceitas,
      this.resumo.totalDespesas,
      this.resumo.pendenteReceber,
      this.resumo.pendentePagar,
      1,
    );
  }

  salvar(): void {
    const dados = {
      ...this.formulario,
      valor: Number(this.formulario.valor),
      dataPagamento: this.formulario.status === 'pago' ? this.formulario.dataPagamento || new Date().toISOString().slice(0, 10) : undefined,
    };

    if (this.editandoId) {
      this.financeiroService.atualizar(this.editandoId, dados);
    } else {
      this.financeiroService.criar(dados);
    }

    this.cancelarEdicao();
  }

  editar(lancamento: LancamentoFinanceiro): void {
    this.editandoId = lancamento.id;
    this.formulario = {
      tipo: lancamento.tipo,
      categoria: lancamento.categoria,
      descricao: lancamento.descricao,
      valor: lancamento.valor,
      status: lancamento.status,
      dataVencimento: this.formatarDataInput(lancamento.dataVencimento),
      dataPagamento: this.formatarDataInput(lancamento.dataPagamento),
      observacoes: lancamento.observacoes || '',
    };
  }

  marcarPago(lancamento: LancamentoFinanceiro): void {
    this.financeiroService.marcarComoPago(lancamento.id);
  }

  remover(id: string): void {
    this.financeiroService.remover(id);
  }

  cancelarEdicao(): void {
    this.editandoId = '';
    this.formulario = this.criarFormularioPadrao();
  }

  percentual(valor: number): number {
    return Math.round((valor / this.maiorValorGrafico) * 100);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  formatarData(data?: string): string {
    if (!data) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
  }

  private criarFormularioPadrao() {
    return {
      tipo: 'receita' as TipoLancamentoFinanceiro,
      categoria: 'servico' as CategoriaFinanceira,
      descricao: '',
      valor: 0,
      status: 'pendente' as StatusLancamentoFinanceiro,
      dataVencimento: new Date().toISOString().slice(0, 10),
      dataPagamento: '',
      observacoes: '',
    };
  }

  private formatarDataInput(data?: string): string {
    return data ? new Date(data).toISOString().slice(0, 10) : '';
  }
}
