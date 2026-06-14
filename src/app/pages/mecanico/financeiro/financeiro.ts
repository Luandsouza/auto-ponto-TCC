import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CategoriaFinanceira,
  LancamentoFinanceiro,
  StatusLancamentoFinanceiro,
  TipoLancamentoFinanceiro,
} from '../../../models/financeiro';
import { AutoChart, AutoChartDatum } from '../../../components/auto-chart/auto-chart';
import { FinanceiroService } from '../../../service/financeiro.service';

@Component({
  selector: 'app-financeiro',
  imports: [CommonModule, FormsModule, AutoChart],
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

  get fluxoChartData(): AutoChartDatum[] {
    return [
      { label: 'Receitas', value: this.resumo.totalReceitas, color: '#1E3A8A' },
      { label: 'Despesas', value: this.resumo.totalDespesas, color: '#374151' },
      { label: 'A receber', value: this.resumo.pendenteReceber, color: '#F59E0B' },
      { label: 'A pagar', value: this.resumo.pendentePagar, color: '#B45309' },
    ];
  }

  get saldoChartData(): AutoChartDatum[] {
    return [
      { label: 'Previsto', value: Math.max(this.resumo.saldo, 0), color: '#1E3A8A' },
      { label: 'Realizado', value: Math.max(this.resumo.saldoRealizado, 0), color: '#F59E0B' },
      { label: 'Pendente', value: this.resumo.pendenteReceber + this.resumo.pendentePagar, color: '#374151' },
    ];
  }

  salvar(): void {
    const dados = {
      ...this.formulario,
      valor: this.converterValorMonetario(this.formulario.valor),
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
      valor: this.formatarValorFormulario(lancamento.valor),
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
      valor: '' as string | number,
      status: 'pendente' as StatusLancamentoFinanceiro,
      dataVencimento: new Date().toISOString().slice(0, 10),
      dataPagamento: '',
      observacoes: '',
    };
  }

  private converterValorMonetario(valor: string | number): number {
    if (typeof valor === 'number') {
      return valor;
    }

    const valorLimpo = valor.trim();

    if (!valorLimpo) {
      return 0;
    }

    if (valorLimpo.includes(',')) {
      return Number(valorLimpo.replace(/\./g, '').replace(',', '.')) || 0;
    }

    const partes = valorLimpo.split('.');
    const ultimoGrupo = partes[partes.length - 1];

    if (partes.length > 1 && ultimoGrupo.length === 3) {
      return Number(partes.join('')) || 0;
    }

    return Number(valorLimpo) || 0;
  }

  private formatarValorFormulario(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  }

  private formatarDataInput(data?: string): string {
    return data ? new Date(data).toISOString().slice(0, 10) : '';
  }
}
