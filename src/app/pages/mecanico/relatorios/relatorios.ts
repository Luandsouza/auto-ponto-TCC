import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AutoChart, AutoChartDatum } from '../../../components/auto-chart/auto-chart';
import { ServicoStatus } from '../../../models/servico';
import { FinanceiroService } from '../../../service/financeiro.service';
import { RelatorioService } from '../../../service/relatorio.service';

type StatusGrafico = {
  status: ServicoStatus;
  label: string;
  total: number;
  percentual: number;
};

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule, AutoChart],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
})
export class Relatorios {
  dataInicial = '';
  dataFinal = '';

  private readonly labelsStatus: Record<ServicoStatus, string> = {
    orcamento: 'Orçamento',
    aprovado: 'Aprovado',
    em_andamento: 'Em andamento',
    aguardando_peca: 'Aguardando peça',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  constructor(
    private readonly relatorioService: RelatorioService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  get periodo() {
    return {
      dataInicial: this.dataInicial || undefined,
      dataFinal: this.dataFinal || undefined,
    };
  }

  get relatorioServicos() {
    return this.relatorioService.gerarRelatorioServicos(this.periodo);
  }

  get relatorioEstoque() {
    return this.relatorioService.gerarRelatorioEstoque();
  }

  get relatorioFinanceiro() {
    return this.relatorioService.gerarRelatorioFinanceiro(this.periodo);
  }

  get lancamentosPeriodo() {
    return this.financeiroService.filtrarPorPeriodo(this.periodo);
  }

  get statusGrafico(): StatusGrafico[] {
    const total = Math.max(this.relatorioServicos.totalServicos, 1);

    return Object.entries(this.relatorioServicos.servicosPorStatus).map(([status, quantidade]) => ({
      status: status as ServicoStatus,
      label: this.labelsStatus[status as ServicoStatus],
      total: quantidade,
      percentual: Math.round((quantidade / total) * 100),
    }));
  }

  get statusChartData(): AutoChartDatum[] {
    const colors: Record<ServicoStatus, string> = {
      orcamento: '#64748b',
      aprovado: '#0ea5e9',
      em_andamento: '#f97316',
      aguardando_peca: '#f59e0b',
      concluido: '#22c55e',
      cancelado: '#ef4444',
    };

    return this.statusGrafico.map((item) => ({
      label: item.label,
      value: item.total,
      color: colors[item.status],
    }));
  }

  get categoriasFinanceiras() {
    const agrupado = this.lancamentosPeriodo.reduce<Record<string, number>>((resultado, lancamento) => {
      if (lancamento.status === 'cancelado') {
        return resultado;
      }

      resultado[lancamento.categoria] = (resultado[lancamento.categoria] || 0) + lancamento.valor;
      return resultado;
    }, {});

    const maior = Math.max(...Object.values(agrupado), 1);

    return Object.entries(agrupado)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: Math.round((valor / maior) * 100),
      }))
      .sort((a, b) => b.valor - a.valor);
  }

  get categoriasChartData(): AutoChartDatum[] {
    const palette = ['#15146f', '#f97316', '#0ea5e9', '#22c55e', '#ef4444', '#64748b'];

    return this.categoriasFinanceiras.map((item, index) => ({
      label: item.categoria,
      value: item.valor,
      color: palette[index % palette.length],
    }));
  }

  get financeiroChartData(): AutoChartDatum[] {
    const resumo = this.relatorioFinanceiro.resumo;

    return [
      { label: 'Receitas', value: resumo.totalReceitas, color: '#22c55e' },
      { label: 'Despesas', value: resumo.totalDespesas, color: '#ef4444' },
      { label: 'Realizado', value: Math.max(resumo.saldoRealizado, 0), color: '#0ea5e9' },
    ];
  }

  get estoqueChartData(): AutoChartDatum[] {
    return [
      { label: 'Custo', value: this.relatorioEstoque.valorTotalCusto, color: '#15146f' },
      { label: 'Venda', value: this.relatorioEstoque.valorTotalVenda, color: '#f97316' },
      { label: 'Críticas', value: this.relatorioEstoque.pecasAbaixoMinimo.length, color: '#ef4444' },
    ];
  }

  get margemEstoque(): number {
    const custo = this.relatorioEstoque.valorTotalCusto;
    const venda = this.relatorioEstoque.valorTotalVenda;

    if (!venda) {
      return 0;
    }

    return Math.round(((venda - custo) / venda) * 100);
  }

  get maiorFinanceiro(): number {
    const resumo = this.relatorioFinanceiro.resumo;
    return Math.max(resumo.totalReceitas, resumo.totalDespesas, resumo.saldoRealizado, 1);
  }

  percentualFinanceiro(valor: number): number {
    return Math.round((Math.abs(valor) / this.maiorFinanceiro) * 100);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
}
