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

  get lancamentosPeriodo(): LancamentoFinanceiro[] {
    return this.financeiroService
      .filtrarPorPeriodo({ dataInicial: this.dataInicial || undefined, dataFinal: this.dataFinal || undefined })
      .slice();
  }

  get lancamentos(): LancamentoFinanceiro[] {
    return this.lancamentosPeriodo
      .filter((lancamento) => this.filtroTipo === 'todos' || lancamento.tipo === this.filtroTipo)
      .filter((lancamento) => this.filtroStatus === 'todos' || lancamento.status === this.filtroStatus)
      .reverse();
  }

  get resumo() {
    return this.financeiroService.gerarResumoDosLancamentos(this.lancamentos);
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
    const saldoPrevisto = this.resumo.saldo;
    const saldoRealizado = this.resumo.saldoRealizado;
    return [
      {
        label: saldoPrevisto >= 0 ? 'Saldo previsto' : 'Déficit previsto',
        value: Math.abs(saldoPrevisto),
        color: saldoPrevisto >= 0 ? '#1E3A8A' : '#DC2626',
      },
      {
        label: saldoRealizado >= 0 ? 'Saldo realizado' : 'Déficit realizado',
        value: Math.abs(saldoRealizado),
        color: saldoRealizado >= 0 ? '#F59E0B' : '#B91C1C',
      },
      { label: 'Pendente', value: this.resumo.pendenteReceber + this.resumo.pendentePagar, color: '#374151' },
    ];
  }

  salvar(): void {
    const valor = this.converterValorMonetario(this.formulario.valor);
    if (!this.formulario.descricao.trim() || valor <= 0 || !this.formulario.dataVencimento) {
      alert('Preencha descrição, valor maior que zero e data de vencimento.');
      return;
    }

    const dados = {
      ...this.formulario,
      descricao: this.formulario.descricao.trim(),
      valor,
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
    if (lancamento.status !== 'pendente') {
      return;
    }
    this.financeiroService.marcarComoPago(lancamento.id);
  }

  remover(id: string): void {
    if (confirm('Deseja excluir este lançamento financeiro?')) {
      this.financeiroService.remover(id);
    }
  }

  limparFiltros(): void {
    this.dataInicial = '';
    this.dataFinal = '';
    this.filtroTipo = 'todos';
    this.filtroStatus = 'todos';
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

    return new Intl.DateTimeFormat('pt-BR').format(
      new Date(`${data.slice(0, 10)}T12:00:00`),
    );
  }

  origemLabel(lancamento: LancamentoFinanceiro): string {
    const labels = {
      manual: 'Manual',
      servico: 'Serviço',
      ordem_servico: 'Ordem de serviço',
    };
    return labels[lancamento.origem || 'manual'];
  }

  podeAlterarCadastro(lancamento: LancamentoFinanceiro): boolean {
    return (lancamento.origem || 'manual') === 'manual';
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
