import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-cliente',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-cliente.html',
  styleUrl: './home-cliente.css',
})
export class HomeCliente {
  etapas = [
    { label: 'Entrada', status: 'concluido' },
    { label: 'Diagnóstico', status: 'concluido' },
    { label: 'Orçamento', status: 'ativo' },
    { label: 'Execução', status: 'pendente' },
    { label: 'Entrega', status: 'pendente' },
  ];

  proximos = [
    { titulo: 'Revisão preventiva', data: 'Hoje, 14:30', detalhe: 'Checklist, freios e filtros' },
    { titulo: 'Retirada prevista', data: 'Amanhã, 10:00', detalhe: 'Após aprovação do orçamento' },
  ];
}
