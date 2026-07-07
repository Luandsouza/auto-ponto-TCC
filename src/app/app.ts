import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarCliente } from "./layouts/layout-cliente/sidebar-cliente/sidebar-cliente";
import { TopbarCliente } from "./layouts/layout-cliente/topbar-cliente/topbar-cliente";
import { Sidebar } from './layouts/layout-mecanico/sidebar/sidebar/sidebar';
import { Topbar } from './layouts/layout-mecanico/topbar/topbar/topbar';

import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarCliente,
    TopbarCliente,
    Sidebar,
    Topbar, 
    ReactiveFormsModule
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('auto-ponto-TCC');
  rotaAtual = '';

  constructor(private readonly router: Router) {
    this.rotaAtual = this.router.url;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.rotaAtual = event.urlAfterRedirects;
      }
    });
  }

  get telaLogin(): boolean {
    return ['/', '', '/home', '/login'].includes(this.rotaAtual);
  }

  get layoutMecanico(): boolean {
    return ['/mecanica', '/servicos', '/estoque', '/financeiro', '/relatorios', '/equipes-mecanico', '/calendario', '/ordens-servico', '/os', '/checklist-os'].some((rota) =>
      this.rotaAtual.startsWith(rota),
    );
  }

  
  
  
  private getRandomColor(): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
