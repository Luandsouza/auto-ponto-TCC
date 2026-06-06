import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Peca, TipoMovimentacaoEstoque } from '../../../models/peca';
import { EstoquePecasService } from '../../../service/estoque-pecas.service';

@Component({
  selector: 'app-estoque',
  imports: [CommonModule, FormsModule],
  templateUrl: './estoque.html',
  styleUrl: './estoque.css',
})
export class Estoque {
  busca = '';
  editandoId = '';
  formulario = this.criarFormularioPadrao();
  movimentacao = {
    pecaId: '',
    tipo: 'entrada' as TipoMovimentacaoEstoque,
    quantidade: 1,
    motivo: '',
  };

  constructor(public readonly estoquePecasService: EstoquePecasService) {}

  get pecas(): Peca[] {
    const termo = this.busca.trim().toLowerCase();
    const pecas = this.estoquePecasService.listarAtual();

    if (!termo) {
      return pecas;
    }

    return pecas.filter((peca) =>
      [peca.nome, peca.codigo, peca.categoria, peca.fabricante, peca.fornecedor]
        .filter(Boolean)
        .some((valor) => valor!.toLowerCase().includes(termo)),
    );
  }

  get movimentacoesRecentes() {
    return this.estoquePecasService.listarMovimentacoesAtual().slice(-5).reverse();
  }

  get totalPecas(): number {
    return this.estoquePecasService.listarAtual().length;
  }

  get abaixoMinimo(): Peca[] {
    return this.estoquePecasService.listarAbaixoDoMinimo();
  }

  get valorCustoTotal(): number {
    return this.estoquePecasService
      .listarAtual()
      .reduce((total, peca) => total + peca.quantidadeAtual * peca.valorCusto, 0);
  }

  salvar(): void {
    const dados = {
      ...this.formulario,
      quantidadeAtual: Number(this.formulario.quantidadeAtual),
      quantidadeMinima: Number(this.formulario.quantidadeMinima),
      valorCusto: Number(this.formulario.valorCusto),
      valorVenda: Number(this.formulario.valorVenda),
      ativo: true,
    };

    if (this.editandoId) {
      this.estoquePecasService.atualizar(this.editandoId, dados);
    } else {
      this.estoquePecasService.criar(dados);
    }

    this.cancelarEdicao();
  }

  editar(peca: Peca): void {
    this.editandoId = peca.id;
    this.formulario = {
      nome: peca.nome,
      codigo: peca.codigo,
      categoria: peca.categoria,
      fabricante: peca.fabricante || '',
      fornecedor: peca.fornecedor || '',
      localizacao: peca.localizacao || '',
      quantidadeAtual: peca.quantidadeAtual,
      quantidadeMinima: peca.quantidadeMinima,
      valorCusto: peca.valorCusto,
      valorVenda: peca.valorVenda,
    };
  }

  registrarMovimentacao(): void {
    if (!this.movimentacao.pecaId || !this.movimentacao.motivo.trim()) {
      return;
    }

    this.estoquePecasService.registrarMovimentacao(
      this.movimentacao.pecaId,
      this.movimentacao.tipo,
      Number(this.movimentacao.quantidade),
      this.movimentacao.motivo,
    );

    this.movimentacao = {
      pecaId: '',
      tipo: 'entrada',
      quantidade: 1,
      motivo: '',
    };
  }

  remover(id: string): void {
    this.estoquePecasService.remover(id);
  }

  cancelarEdicao(): void {
    this.editandoId = '';
    this.formulario = this.criarFormularioPadrao();
  }

  nomePeca(id: string): string {
    return this.estoquePecasService.buscarPorId(id)?.nome || 'Peça removida';
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private criarFormularioPadrao() {
    return {
      nome: '',
      codigo: '',
      categoria: '',
      fabricante: '',
      fornecedor: '',
      localizacao: '',
      quantidadeAtual: 0,
      quantidadeMinima: 1,
      valorCusto: 0,
      valorVenda: 0,
    };
  }
}
