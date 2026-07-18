import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-historico-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico-cliente.html',
  styleUrl: './historico-cliente.css',
})
export class HistoricoCliente {

  modalAberto = false;

  abrirModal() {
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

}