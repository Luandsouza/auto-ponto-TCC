import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type ClienteMenuItem = {
  label: string;
  route: string;
  iconPaths: string[];
  accent: string;
};

const icons = {
  home: ['M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z'],
  calendar: ['M8 3v3', 'M16 3v3', 'M4 9h16', 'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
  history: ['M4 7v5h5', 'M5.5 12A7 7 0 1 0 12 5a7 7 0 0 0-6.5 4.4', 'M12 8v5l3 2'],
  wrench: ['M14.7 6.3a4 4 0 0 0 5 5L11 20l-5-5 8.7-8.7z'],
};

@Component({
  selector: 'app-sidebar-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-cliente.html',
  styleUrl: './sidebar-cliente.css',
})
export class SidebarCliente {
  menuItems: ClienteMenuItem[] = [
    {
      label: 'Home',
      route: '/home',
      iconPaths: icons.home,
      accent: '#1aa7f2',
    },
    {
      label: 'Agenda de Serviço',
      route: '/agenda',
      iconPaths: icons.calendar,
      accent: '#ff7418',
    },
    {
      label: 'Histórico',
      route: '/historico',
      iconPaths: icons.history,
      accent: '#0ea5e9',
    },
    {
      label: 'Status dos Serviços',
      route: '/status',
      iconPaths: icons.wrench,
      accent: '#22c55e',
    },
  ];
}
