import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AgendamentoCliente,
} from '../../../../models/agendamento-cliente';
import { OrdemServicoService } from '../../../../service/ordem-servico.service';

interface VeiculoCliente {
  marca: string;
  modelo: string;
  placa: string;
}

@Component({
  selector: 'app-lista-agenda-cliente',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './lista-agenda-cliente.html',
  styleUrl: './lista-agenda-cliente.css',
})
export class ListaAgendaCliente implements OnInit {
  showModal = false;
  filtro = '';
  agendamentos: AgendamentoCliente[] = [];
  veiculos: VeiculoCliente[] = [];
  formulario = this.novoFormulario();

  constructor(private readonly ordemServicoService: OrdemServicoService) {}

  ngOnInit() {
    this.carregarDados();
    this.ordemServicoService.agendamentos$.subscribe(
      agendamentos => (this.agendamentos = agendamentos),
    );
  }

  get agendamentosFiltrados() {
    const termo = this.filtro.trim().toLowerCase();
    if (!termo) {
      return this.agendamentos;
    }
    return this.agendamentos.filter(item =>
      [item.automovel, item.placa, item.servico, item.status]
        .some(valor => valor.toLowerCase().includes(termo)),
    );
  }

  abrirModal() {
    this.formulario = this.novoFormulario();
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
  }

  salvarAgendamento() {
    const veiculo = this.veiculos.find(item => item.placa === this.formulario.placa);
    if (!veiculo) {
      return;
    }

    this.ordemServicoService.criarAgendamento({
      id: Date.now(),
      cliente: 'Cliente Auto Ponto',
      automovel: `${veiculo.marca} ${veiculo.modelo}`,
      placa: veiculo.placa,
      servico: this.formulario.servico,
      data: this.formulario.data,
      hora: this.formulario.hora,
      observacao: this.formulario.observacao,
      status: 'Solicitado',
      atualizadoEm: new Date().toISOString(),
    });
    this.fecharModal();
  }

  cancelarAgendamento(item: AgendamentoCliente) {
    if (!this.podeCancelar(item)) {
      return;
    }
    this.ordemServicoService.cancelarPeloCliente(item.id);
  }

  podeCancelar(item: AgendamentoCliente): boolean {
    return (
      item.status !== 'Finalizado' &&
      item.status !== 'Cancelado' &&
      this.ordemServicoService.podeCancelarAgendamento(item.id)
    );
  }

  private carregarDados() {
    this.agendamentos = this.ordemServicoService.listarAgendamentos();

    const veiculosSalvos = localStorage.getItem('veiculos');
    this.veiculos = veiculosSalvos ? JSON.parse(veiculosSalvos) : [];
  }

  private novoFormulario() {
    return {
      placa: '',
      servico: '',
      data: '',
      hora: '',
      observacao: '',
    };
  }
}
