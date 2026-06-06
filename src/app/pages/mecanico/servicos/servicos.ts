import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Servico, ServicoCategoria, ServicoStatus } from '../../../models/servico';
import { FinanceiroService } from '../../../service/financeiro.service';
import { ServicoService } from '../../../service/servico.service';

@Component({
  selector: 'app-servicos',
  imports: [CommonModule, FormsModule],
  templateUrl: './servicos.html',
  styleUrl: './servicos.css',
})
export class Servicos {
  filtroStatus = 'todos';
  editandoId = '';

  categorias: ServicoCategoria[] = ['revisao', 'manutencao', 'funilaria', 'eletrica', 'diagnostico', 'outros'];
  statusDisponiveis: ServicoStatus[] = ['orcamento', 'aprovado', 'em_andamento', 'aguardando_peca', 'concluido', 'cancelado'];

  formulario = this.criarFormularioPadrao();

  constructor(
    private readonly servicoService: ServicoService,
    private readonly financeiroService: FinanceiroService,
  ) {}

  get servicos(): Servico[] {
    const lista = this.servicoService.listarAtual().slice().reverse();

    if (this.filtroStatus === 'todos') {
      return lista;
    }

    return lista.filter((servico) => servico.status === this.filtroStatus);
  }

  get totalAberto(): number {
    return this.servicoService
      .listarAtual()
      .filter((servico) => !['concluido', 'cancelado'].includes(servico.status)).length;
  }

  get totalFaturado(): number {
    return this.servicoService
      .listarAtual()
      .filter((servico) => servico.status === 'concluido')
      .reduce((total, servico) => total + servico.total, 0);
  }

  get ticketMedio(): number {
    const servicos = this.servicoService.listarAtual();
    const total = servicos.reduce((soma, servico) => soma + servico.total, 0);
    return servicos.length ? total / servicos.length : 0;
  }

  salvar(): void {
    const dados = {
      ...this.formulario,
      valorMaoObra: Number(this.formulario.valorMaoObra),
      valorPecas: Number(this.formulario.valorPecas),
      desconto: Number(this.formulario.desconto),
      pecas: [],
    };

    if (this.editandoId) {
      this.servicoService.atualizar(this.editandoId, dados);
    } else {
      const servico = this.servicoService.criar(dados);
      this.financeiroService.criar({
        tipo: 'receita',
        categoria: 'servico',
        descricao: servico.titulo,
        valor: servico.total,
        status: servico.status === 'concluido' ? 'pago' : 'pendente',
        dataVencimento: servico.dataPrevisao || servico.dataAbertura,
        dataPagamento: servico.status === 'concluido' ? new Date().toISOString() : undefined,
        servicoId: servico.id,
        observacoes: 'Gerado pelo cadastro de serviços.',
      });
    }

    this.cancelarEdicao();
  }

  editar(servico: Servico): void {
    this.editandoId = servico.id;
    this.formulario = {
      titulo: servico.titulo,
      descricao: servico.descricao,
      categoria: servico.categoria,
      status: servico.status,
      valorMaoObra: servico.valorMaoObra,
      valorPecas: servico.valorPecas,
      desconto: servico.desconto,
      dataAbertura: this.formatarDataInput(servico.dataAbertura),
      dataPrevisao: this.formatarDataInput(servico.dataPrevisao),
      observacoes: servico.observacoes || '',
    };
  }

  concluir(servico: Servico): void {
    this.servicoService.concluir(servico.id);
  }

  remover(id: string): void {
    this.servicoService.remover(id);
  }

  cancelarEdicao(): void {
    this.editandoId = '';
    this.formulario = this.criarFormularioPadrao();
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private criarFormularioPadrao() {
    return {
      titulo: '',
      descricao: '',
      categoria: 'revisao' as ServicoCategoria,
      status: 'orcamento' as ServicoStatus,
      valorMaoObra: 0,
      valorPecas: 0,
      desconto: 0,
      dataAbertura: new Date().toISOString().slice(0, 10),
      dataPrevisao: '',
      observacoes: '',
    };
  }

  private formatarDataInput(data?: string): string {
    return data ? new Date(data).toISOString().slice(0, 10) : '';
  }
}
