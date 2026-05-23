import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  menuItems = [
    {
      label: 'Home',
      route: '/',
      colorClass: 'bg-fuel',
      active: true
    },
    {
      label: 'Agenda de Serviço',
      route: '/agenda',
      colorClass: 'bg-mint',
      active: false
    },
    {
      label: 'Histórico',
      route: '/historico',
      colorClass: 'bg-sky-500',
      active: false
    },
    {
      label: 'Status dos Serviços',
      route: '/status',
      colorClass: 'bg-yellow-400',
      active: false
    }
  ];

}