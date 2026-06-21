import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutoChart, AutoChartDatum } from '../../../components/auto-chart/auto-chart';
import { FinanceiroService } from '../../../service/financeiro.service';
import { EstoquePecasService } from '../../../service/estoque-pecas.service';
import { ServicoService } from '../../../service/servico.service';

@Component({
  selector: 'app-home-mecanico',
  imports: [CommonModule, RouterLink, AutoChart],
  templateUrl: './home-mecanico.html',
  styleUrl: './home-mecanico.css',
})
export class HomeMecanico {
  constructor(
    private readonly servicoService: ServicoService,
    private readonly estoquePecasService: EstoquePecasService,
    private readonly financeiroService: FinanceiroService,
  ) {
    this.garantirDadosDemonstrativos();
  }

  get servicosAtivos(): number {
    return this.servicoService
      .listarAtual()
      .filter((servico) => !['concluido', 'cancelado'].includes(servico.status)).length;
  }

  get servicosConcluidos(): number {
    return this.servicoService.filtrarPorStatus('concluido').length;
  }

  get pecasBaixoEstoque(): number {
    return this.estoquePecasService.listarAbaixoDoMinimo().length;
  }

  get resumoFinanceiro() {
    return this.financeiroService.gerarResumo();
  }

  get valorEstoque(): number {
    return this.estoquePecasService
      .listarAtual()
      .reduce((total, peca) => total + peca.quantidadeAtual * peca.valorCusto, 0);
  }

  get ultimosServicos() {
    return this.servicoService.listarAtual().slice(-4).reverse();
  }

  get operacaoChartData(): AutoChartDatum[] {
    return [
      { label: 'Ativos', value: this.servicosAtivos, color: '#1E3A8A' },
      { label: 'Concluídos', value: this.servicosConcluidos, color: '#F59E0B' },
      { label: 'Estoque baixo', value: this.pecasBaixoEstoque, color: '#374151' },
    ];
  }

  get caixaChartData(): AutoChartDatum[] {
    const saldoRealizado = this.resumoFinanceiro.saldoRealizado;
    return [
      { label: 'Receitas', value: this.resumoFinanceiro.totalReceitas, color: '#1E3A8A' },
      { label: 'Despesas', value: this.resumoFinanceiro.totalDespesas, color: '#374151' },
      {
        label: saldoRealizado >= 0 ? 'Saldo realizado' : 'Déficit realizado',
        value: Math.abs(saldoRealizado),
        color: saldoRealizado >= 0 ? '#F59E0B' : '#B91C1C',
      },
    ];
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private garantirDadosDemonstrativos(): void {
    const dias = (quantidade: number) =>
      new Date(Date.now() + quantidade * 86400000).toISOString();

    const obterPeca = (dados: Parameters<EstoquePecasService['criar']>[0]) => {
      const existente = this.estoquePecasService
        .listarAtual()
        .find((peca) => peca.codigo === dados.codigo);

      return existente || this.estoquePecasService.criar(dados);
    };

    const pastilha = obterPeca({
      nome: 'Pastilha de freio dianteira',
      codigo: 'PF-204',
      categoria: 'Freio',
      fabricante: 'Bosch',
      fornecedor: 'Auto Peças Central',
      localizacao: 'Prateleira A2',
      quantidadeAtual: 8,
      quantidadeMinima: 5,
      valorCusto: 72,
      valorVenda: 119,
      ativo: true,
    });

    const filtroOleo = obterPeca({
      nome: 'Filtro de óleo premium',
      codigo: 'FO-110',
      categoria: 'Motor',
      fabricante: 'Tecfil',
      fornecedor: 'Distribuidora Sul',
      localizacao: 'Prateleira B1',
      quantidadeAtual: 3,
      quantidadeMinima: 6,
      valorCusto: 28,
      valorVenda: 49,
      ativo: true,
    });

    const oleo = obterPeca({
      nome: 'Óleo sintético 5W30',
      codigo: 'OL-530',
      categoria: 'Lubrificantes',
      fabricante: 'Mobil',
      fornecedor: 'LubriMais',
      localizacao: 'Corredor C1',
      quantidadeAtual: 18,
      quantidadeMinima: 10,
      valorCusto: 36,
      valorVenda: 69,
      ativo: true,
    });

    const bateria = obterPeca({
      nome: 'Bateria 60Ah selada',
      codigo: 'BAT-60',
      categoria: 'Elétrica',
      fabricante: 'Moura',
      fornecedor: 'Eletro Auto Vale',
      localizacao: 'Bancada E3',
      quantidadeAtual: 2,
      quantidadeMinima: 4,
      valorCusto: 318,
      valorVenda: 489,
      ativo: true,
    });

    const correia = obterPeca({
      nome: 'Correia dentada',
      codigo: 'CD-089',
      categoria: 'Motor',
      fabricante: 'Gates',
      fornecedor: 'Auto Peças Central',
      localizacao: 'Prateleira B4',
      quantidadeAtual: 6,
      quantidadeMinima: 3,
      valorCusto: 84,
      valorVenda: 149,
      ativo: true,
    });

    const amortecedor = obterPeca({
      nome: 'Amortecedor dianteiro',
      codigo: 'AM-221',
      categoria: 'Suspensão',
      fabricante: 'Monroe',
      fornecedor: 'Suspensão Pro',
      localizacao: 'Rack D2',
      quantidadeAtual: 4,
      quantidadeMinima: 4,
      valorCusto: 210,
      valorVenda: 349,
      ativo: true,
    });

    const servicosDemo: Parameters<ServicoService['criar']>[0][] = [
      {
        titulo: 'Revisão preventiva completa',
        descricao: 'Troca de óleo, filtro, inspeção de freios e checklist geral.',
        categoria: 'revisao',
        status: 'em_andamento',
        valorMaoObra: 280,
        valorPecas: oleo.valorVenda + filtroOleo.valorVenda + pastilha.valorVenda,
        desconto: 30,
        pecas: [
          { pecaId: oleo.id, nome: oleo.nome, quantidade: 1, valorUnitario: oleo.valorVenda },
          { pecaId: filtroOleo.id, nome: filtroOleo.nome, quantidade: 1, valorUnitario: filtroOleo.valorVenda },
          { pecaId: pastilha.id, nome: pastilha.nome, quantidade: 1, valorUnitario: pastilha.valorVenda },
        ],
        dataAbertura: dias(-1),
        dataPrevisao: dias(1),
        observacoes: 'Cliente pediu prioridade na entrega.',
      },
      {
        titulo: 'Troca de bateria e teste do alternador',
        descricao: 'Substituição da bateria, limpeza de terminais e teste de carga.',
        categoria: 'eletrica',
        status: 'concluido',
        valorMaoObra: 160,
        valorPecas: bateria.valorVenda,
        desconto: 0,
        pecas: [{ pecaId: bateria.id, nome: bateria.nome, quantidade: 1, valorUnitario: bateria.valorVenda }],
        dataAbertura: dias(-7),
        dataPrevisao: dias(-6),
        dataConclusao: dias(-6),
        observacoes: 'Serviço finalizado e pago no balcão.',
      },
      {
        titulo: 'Substituição de correia dentada',
        descricao: 'Troca preventiva da correia e inspeção de sincronismo do motor.',
        categoria: 'manutencao',
        status: 'aprovado',
        valorMaoObra: 420,
        valorPecas: correia.valorVenda,
        desconto: 20,
        pecas: [{ pecaId: correia.id, nome: correia.nome, quantidade: 1, valorUnitario: correia.valorVenda }],
        dataAbertura: dias(-2),
        dataPrevisao: dias(2),
        observacoes: 'Peças separadas para execução amanhã.',
      },
      {
        titulo: 'Diagnóstico elétrico do painel',
        descricao: 'Falha intermitente no painel e teste de bateria em carga.',
        categoria: 'diagnostico',
        status: 'orcamento',
        valorMaoObra: 180,
        valorPecas: 0,
        desconto: 0,
        pecas: [],
        dataAbertura: dias(0),
        dataPrevisao: dias(3),
        observacoes: 'Aguardando aprovação do orçamento.',
      },
      {
        titulo: 'Reparo de suspensão dianteira',
        descricao: 'Troca de amortecedores dianteiros e alinhamento preliminar.',
        categoria: 'manutencao',
        status: 'em_andamento',
        valorMaoObra: 360,
        valorPecas: amortecedor.valorVenda * 2,
        desconto: 50,
        pecas: [{ pecaId: amortecedor.id, nome: amortecedor.nome, quantidade: 2, valorUnitario: amortecedor.valorVenda }],
        dataAbertura: dias(-3),
        dataPrevisao: dias(1),
        observacoes: 'Veículo permanece no elevador hidráulico.',
      },
      {
        titulo: 'Troca de óleo expressa',
        descricao: 'Troca de óleo sintético e conferência de níveis.',
        categoria: 'manutencao',
        status: 'concluido',
        valorMaoObra: 95,
        valorPecas: oleo.valorVenda + filtroOleo.valorVenda,
        desconto: 0,
        pecas: [
          { pecaId: oleo.id, nome: oleo.nome, quantidade: 1, valorUnitario: oleo.valorVenda },
          { pecaId: filtroOleo.id, nome: filtroOleo.nome, quantidade: 1, valorUnitario: filtroOleo.valorVenda },
        ],
        dataAbertura: dias(-12),
        dataPrevisao: dias(-12),
        dataConclusao: dias(-12),
        observacoes: 'Serviço rápido concluído no mesmo dia.',
      },
    ];

    const servicosCriados = servicosDemo.map((dados) => {
      const existente = this.servicoService
        .listarAtual()
        .find((servico) => servico.titulo === dados.titulo);

      return existente || this.servicoService.criar(dados);
    });

    const criarLancamentoSeAusente = (dados: Parameters<FinanceiroService['criar']>[0]) => {
      const existente = this.financeiroService
        .listarAtual()
        .some((lancamento) => lancamento.descricao === dados.descricao);

      if (!existente) {
        this.financeiroService.criar(dados);
      }
    };

    servicosCriados.forEach((servico) => {
      this.financeiroService.sincronizarServico(servico);
    });

    [
      {
        descricao: 'Compra de filtros, óleo e pastilhas',
        valor: 780,
        data: dias(-10),
      },
      {
        descricao: 'Reposição de baterias e correias',
        valor: 1260,
        data: dias(-5),
      },
      {
        descricao: 'Pedido de amortecedores dianteiros',
        valor: 840,
        data: dias(2),
      },
    ].forEach((despesa) => {
      criarLancamentoSeAusente({
        tipo: 'despesa',
        categoria: 'fornecedor',
        descricao: despesa.descricao,
        valor: despesa.valor,
        status: despesa.data <= dias(0) ? 'pago' : 'pendente',
        dataVencimento: despesa.data,
        dataPagamento: despesa.data <= dias(0) ? despesa.data : undefined,
        observacoes: 'Despesa demonstrativa de reposição de estoque.',
      });
    });
  }
}
