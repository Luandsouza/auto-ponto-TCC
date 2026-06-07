import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarCliente } from "./layouts/layout-cliente/sidebar-cliente/sidebar-cliente";
import { TopbarCliente } from "./layouts/layout-cliente/topbar-cliente/topbar-cliente";
import { Sidebar } from './layouts/layout-mecanico/sidebar/sidebar/sidebar';
import { Topbar } from './layouts/layout-mecanico/topbar/topbar/topbar';
import { CalendarioComponent } from './pages/mecanico/calendario/calendario.component';

import { ReactiveFormsModule } from '@angular/forms';
import { CadastroVeiculosComponent } from './pages/mecanico/cadastro-veiculos/cadastro-veiculos';
import { OrdensServicoComponent } from './pages/mecanico/ordens-servico/ordens-servico.component';
import { ChecklistOsComponent } from './pages/mecanico/checklist-os/checklist-os.component';
import { KanbanServicosComponent } from './pages/mecanico/kanban-servicos/kanban-servicos.component';

@Component({
  selector: 'app-root',
  standalone: true, // Importante: marcar como standalone
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarCliente, 
    TopbarCliente, 
    Sidebar, 
    Topbar, 
    CalendarioComponent,
    ChecklistOsComponent,
    OrdensServicoComponent,
    KanbanServicosComponent,
    CadastroVeiculosComponent, // Adicione aqui!
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
    return this.rotaAtual === '/' || this.rotaAtual === '';
  }

  get layoutMecanico(): boolean {
    return ['/mecanica', '/servicos', '/estoque', '/financeiro', '/relatorios', '/calendario', '/cadastro-veiculos', '/ordens-servico','/checklist-os','/kanban-servicos'].some((rota) =>
      this.rotaAtual.startsWith(rota),
    );
  }

  
  
  
  private getRandomColor(): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}