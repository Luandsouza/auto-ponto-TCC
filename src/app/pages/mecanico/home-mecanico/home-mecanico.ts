import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FinanceiroService } from '../../../service/financeiro.service';
import { EstoquePecasService } from '../../../service/estoque-pecas.service';
import { ServicoService } from '../../../service/servico.service';

@Component({
  selector: 'app-home-mecanico',
  imports: [CommonModule, RouterLink],
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

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private garantirDadosDemonstrativos(): void {
    if (
      this.servicoService.listarAtual().length ||
      this.estoquePecasService.listarAtual().length ||
      this.financeiroService.listarAtual().length
    ) {
      return;
    }

    const pastilha = this.estoquePecasService.criar({
      nome: 'Pastilha de freio',
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

    this.estoquePecasService.criar({
      nome: 'Filtro de óleo',
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

    const servico = this.servicoService.criar({
      titulo: 'Revisão preventiva',
      descricao: 'Troca de filtros, inspeção de freios e checklist geral.',
      categoria: 'revisao',
      status: 'em_andamento',
      valorMaoObra: 280,
      valorPecas: 119,
      desconto: 20,
      pecas: [{ pecaId: pastilha.id, nome: pastilha.nome, quantidade: 1, valorUnitario: pastilha.valorVenda }],
      dataAbertura: new Date().toISOString(),
      dataPrevisao: new Date(Date.now() + 86400000).toISOString(),
      observacoes: 'Cliente pediu prioridade na entrega.',
    });

    this.servicoService.criar({
      titulo: 'Diagnóstico elétrico',
      descricao: 'Falha intermitente no painel e teste de bateria.',
      categoria: 'eletrica',
      status: 'orcamento',
      valorMaoObra: 180,
      valorPecas: 0,
      desconto: 0,
      pecas: [],
      dataAbertura: new Date().toISOString(),
      observacoes: 'Aguardando aprovação do orçamento.',
    });

    this.financeiroService.criar({
      tipo: 'receita',
      categoria: 'servico',
      descricao: servico.titulo,
      valor: servico.total,
      status: 'pendente',
      dataVencimento: new Date().toISOString(),
      servicoId: servico.id,
      observacoes: 'Receita vinculada ao serviço.',
    });

    this.financeiroService.criar({
      tipo: 'despesa',
      categoria: 'fornecedor',
      descricao: 'Compra de filtros e pastilhas',
      valor: 420,
      status: 'pago',
      dataVencimento: new Date().toISOString(),
      dataPagamento: new Date().toISOString(),
      observacoes: 'Reposição inicial para demonstração.',
    });
  }
}
