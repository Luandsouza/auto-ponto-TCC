import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarCliente } from "./layouts/layout-cliente/sidebar-cliente/sidebar-cliente";
import { TopbarCliente } from "./layouts/layout-cliente/topbar-cliente/topbar-cliente";
import { Sidebar } from './layouts/layout-mecanico/sidebar/sidebar/sidebar';
import { Topbar } from './layouts/layout-mecanico/topbar/topbar/topbar';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, SidebarCliente, TopbarCliente, Sidebar, Topbar],
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
    return this.rotaAtual === '/' || this.rotaAtual === '';
  }

  get layoutMecanico(): boolean {
    return ['/mecanica', '/servicos', '/estoque', '/financeiro', '/relatorios'].some((rota) =>
      this.rotaAtual.startsWith(rota),
    );
  }
}
