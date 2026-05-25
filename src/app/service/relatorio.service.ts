import { Injectable } from '@angular/core';

import { Peca } from '../models/peca';
import {
  FiltroPeriodo,
  RelatorioEstoque,
  RelatorioFinanceiro,
  RelatorioServicos,
} from '../models/relatorio';
import { Servico, ServicoStatus } from '../models/servico';
import { EstoquePecasService } from './estoque-pecas.service';
import { FinanceiroService } from './financeiro.service';
import { ServicoService } from './servico.service';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  constructor(
    private readonly servicoService: ServicoService,
    private readonly estoquePecasService: EstoquePecasService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  gerarRelatorioServicos(periodo: FiltroPeriodo = {}): RelatorioServicos {
    const servicos = this.servicoService
      .listarAtual()
      .filter((servico) => this.estaNoPeriodo(servico.dataAbertura, periodo));

    return {
      totalServicos: servicos.length,
      totalFaturado: servicos
        .filter((servico) => servico.status === 'concluido')
        .reduce((total, servico) => total + servico.total, 0),
      servicosPorStatus: this.contarPorStatus(servicos),
      servicos,
    };
  }

  gerarRelatorioEstoque(): RelatorioEstoque {
    const pecas = this.estoquePecasService.listarAtual();

    return {
      totalPecas: pecas.length,
      valorTotalCusto: this.calcularValorEstoque(pecas, 'valorCusto'),
      valorTotalVenda: this.calcularValorEstoque(pecas, 'valorVenda'),
      pecasAbaixoMinimo: this.estoquePecasService.listarAbaixoDoMinimo(),
    };
  }

  gerarRelatorioFinanceiro(periodo: FiltroPeriodo = {}): RelatorioFinanceiro {
    return {
      periodo,
      resumo: this.financeiroService.gerarResumo(periodo),
    };
  }

  private contarPorStatus(servicos: Servico[]): Record<ServicoStatus, number> {
    const status: ServicoStatus[] = [
      'orcamento',
      'aprovado',
      'em_andamento',
      'aguardando_peca',
      'concluido',
      'cancelado',
    ];

    return status.reduce(
      (contador, item) => ({
        ...contador,
        [item]: servicos.filter((servico) => servico.status === item).length,
      }),
      {} as Record<ServicoStatus, number>,
    );
  }

  private calcularValorEstoque(pecas: Peca[], campo: 'valorCusto' | 'valorVenda'): number {
    return pecas.reduce((total, peca) => total + peca.quantidadeAtual * peca[campo], 0);
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
}
