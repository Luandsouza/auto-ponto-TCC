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
     {
      label: 'Calendário',
      route: 'calendario',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
     {
      label: 'Ordens de serviço',
      route: '/ordern-de-servico',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
      {
      label: 'Checklist da OS',
      route: '/checklist-da-os',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
      {
      label: 'Kanban de serviços',
      route: '/kaban-de-servicos',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
      {
      label: 'Cadastro de veículos',
      route: '/cadastro-de-veiculos',
      icon: 'chart',
      colorClass: 'bg-sky-500',
    },
  ];
}
