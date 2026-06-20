import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type MenuItem = {
  label: string;
  route: string;
  iconPaths: string[];
  accent: string;
};

const icons = {
  gauge: ['M4 13a8 8 0 0 1 16 0', 'M12 13l4-5', 'M7 18h10'],
  clipboard: ['M9 5h6', 'M9 3h6a1 1 0 0 1 1 1v2H8V4a1 1 0 0 1 1-1z', 'M6 6h12a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z', 'M8 12h8', 'M8 16h5'],
  box: ['M21 8l-9-5-9 5 9 5 9-5z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  wallet: ['M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z', 'M16 12h5', 'M6 7V5a2 2 0 0 1 2-2h8'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16V9', 'M12 16V7', 'M16 16v-4'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  calendar: ['M8 3v3', 'M16 3v3', 'M4 9h16', 'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
  checklist: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'M4 6l1 1 2-2', 'M4 12l1 1 2-2', 'M4 18l1 1 2-2'],
  wrench: ['M14.7 6.3a4 4 0 0 0 5 5L11 20l-5-5 8.7-8.7z'],
};

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuItems: MenuItem[] = [
    {
      label: 'Painel',
      route: '/mecanica',
      iconPaths: icons.gauge,
      accent: '#1E3A8A',
    },
    {
      label: 'Serviços',
      route: '/servicos',
      iconPaths: icons.clipboard,
      accent: '#F59E0B',
    },
    {
      label: 'Estoque',
      route: '/estoque',
      iconPaths: icons.box,
      accent: '#374151',
    },
    {
      label: 'Financeiro',
      route: '/financeiro',
      iconPaths: icons.wallet,
      accent: '#1E3A8A',
    },
    {
      label: 'Relatórios',
      route: '/relatorios',
      iconPaths: icons.chart,
      accent: '#1E3A8A',
    },
    {
      label: 'Equipes',
      route: '/equipes-mecanico',
      iconPaths: icons.users,
      accent: '#0F766E',
    },
    {
      label: 'Calendário',
      route: '/calendario',
      iconPaths: icons.calendar,
      accent: '#F59E0B',
    },
    {
      label: 'Ordens de serviço',
      route: '/ordens-servico',
      iconPaths: icons.wrench,
      accent: '#F59E0B',
    },
    {
      label: 'Checklist da OS',
      route: '/checklist-os',
      iconPaths: icons.checklist,
      accent: '#374151',
    },
  ];
}
