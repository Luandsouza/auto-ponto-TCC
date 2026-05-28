import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-cliente.html',
  styleUrl: './sidebar-cliente.css',
})
export class SidebarCliente {
  menuItems = [
    {
      label: 'Home',
      route: 'home',
      icon: 'home',
      colorClass: 'bg-auto-blue',
      active: true,
    },
    {
      label: 'Agenda de Serviço',
      route: '/agenda',
      icon: 'calendar',
      colorClass: 'bg-auto-orange',
      active: false,
    },
    {
      label: 'Histórico',
      route: '/historico',
      icon: 'history',
      colorClass: 'bg-sky-500',
      active: false,
    },
    {
      label: 'Status dos Serviços',
      route: '/status',
      icon: 'wrench',
      colorClass: 'bg-yellow-400',
      active: false,
    },
  ];
}
