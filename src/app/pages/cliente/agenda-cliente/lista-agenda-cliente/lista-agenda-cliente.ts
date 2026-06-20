import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AGENDAMENTOS_STORAGE_KEY,
  AgendamentoCliente,
} from '../../../../models/agendamento-cliente';

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

  ngOnInit() {
    this.carregarDados();
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

    this.agendamentos.unshift({
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
    this.persistir();
    this.fecharModal();
  }

  cancelarAgendamento(item: AgendamentoCliente) {
    if (['Concluída', 'Cancelada'].includes(item.status)) {
      return;
    }
    item.status = 'Cancelada';
    item.atualizadoEm = new Date().toISOString();
    this.persistir();
  }

  private carregarDados() {
    const agendamentosSalvos = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
    this.agendamentos = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];

    const veiculosSalvos = localStorage.getItem('veiculos');
    this.veiculos = veiculosSalvos ? JSON.parse(veiculosSalvos) : [];
  }

  private persistir() {
    localStorage.setItem(AGENDAMENTOS_STORAGE_KEY, JSON.stringify(this.agendamentos));
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
