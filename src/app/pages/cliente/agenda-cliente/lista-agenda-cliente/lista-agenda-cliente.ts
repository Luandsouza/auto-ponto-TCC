import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule, } from "../../../../../../node_modules/@angular/common/types/_common_module-chunk";
import { FormsModule } from '@angular/forms';

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
