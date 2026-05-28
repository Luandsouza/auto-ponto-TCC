import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuItems = [
    {
      label: 'Serviços',
      route: '/servicos',
      icon: 'clipboard',
      colorClass: 'bg-auto-blue',
    },
    {
      label: 'Estoque',
      route: '/estoque',
      icon: 'box',
      colorClass: 'bg-auto-orange',
    },
    {
      label: 'Financeiro',
      route: '/financeiro',
      icon: 'wallet',
      colorClass: 'bg-auto-navy',
    },
    {
      label: 'Relatórios',
      route: '/relatorios',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
  ];
}
