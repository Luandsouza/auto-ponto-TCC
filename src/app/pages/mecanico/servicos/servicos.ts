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
      const servico = this.servicoService.atualizar(this.editandoId, dados);
      if (servico) {
        this.financeiroService.sincronizarServico(servico);
      }
    } else {
      const servico = this.servicoService.criar(dados);
      this.financeiroService.sincronizarServico(servico);
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

  remover(id: string): void {
    const lancamento = this.financeiroService
      .listarAtual()
      .find(item => item.servicoId === id);
    if (lancamento) {
      this.financeiroService.atualizar(lancamento.id, { status: 'cancelado' });
    }
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
