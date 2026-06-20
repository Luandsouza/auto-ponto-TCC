import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AGENDAMENTOS_STORAGE_KEY,
  AgendamentoCliente,
} from '../../../models/agendamento-cliente';

@Component({
  selector: 'app-status-servicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-servicos.html',
})
export class StatusServicos implements OnInit {
  atendimentos: AgendamentoCliente[] = [];

  ngOnInit() {
    const saved = localStorage.getItem(AGENDAMENTOS_STORAGE_KEY);
    this.atendimentos = saved ? JSON.parse(saved) : [];
  }
}
