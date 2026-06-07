import { Component} from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-agenda-cliente',
  imports: [FormsModule,CommonModule],
  templateUrl: './lista-agenda-cliente.html',
  styleUrl: './lista-agenda-cliente.css',
})
export class ListaAgendaCliente {
  showModal = false;
 

  abrirModal() {
    this.showModal = true;
  }
}
