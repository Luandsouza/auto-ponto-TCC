import { Peca } from './peca';
import { ResumoFinanceiro } from './financeiro';
import { Servico, ServicoStatus } from './servico';

export interface FiltroPeriodo {
  dataInicial?: string;
  dataFinal?: string;
}

export interface RelatorioServicos {
  totalServicos: number;
  totalFaturado: number;
  servicosPorStatus: Record<ServicoStatus, number>;
  servicos: Servico[];
}

export interface RelatorioEstoque {
  totalPecas: number;
  valorTotalCusto: number;
  valorTotalVenda: number;
  pecasAbaixoMinimo: Peca[];
}

export interface RelatorioFinanceiro {
  periodo: FiltroPeriodo;
  resumo: ResumoFinanceiro;
}
