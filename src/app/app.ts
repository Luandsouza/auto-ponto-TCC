import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarCliente } from "./layouts/layout-cliente/sidebar-cliente/sidebar-cliente";
import { TopbarCliente } from "./layouts/layout-cliente/topbar-cliente/topbar-cliente";
import { Sidebar } from './layouts/layout-mecanico/sidebar/sidebar/sidebar';
import { Topbar } from './layouts/layout-mecanico/topbar/topbar/topbar';
import { CalendarComponent, CalendarEvent } from './layouts/layout-mecanico/sidebar/sidebar/calendario/calendario';


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

  myEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Reunião',
      date: new Date(2026, 5, 10),
      color: '#FF5722',
      description: 'Reunião de equipe às 10h'
    },
    {
      id: 2,
      title: 'Aniversário',
      date: new Date(2026, 5, 15),
      color: '#9C27B0'
    },
    {
      id: 3,
      title: 'Deadline',
      date: new Date(2026, 5, 20),
      color: '#F44336'
    }
  ];
  
  selectedDateInfo: Date | null = null;
  newEventTitle: string = '';
  newEventDate: string = '';
  
  onDateSelected(date: Date): void {
    this.selectedDateInfo = date;
    console.log('Data selecionada:', date);
  }
  
  onEventClicked(event: CalendarEvent): void {
    console.log('Evento clicado:', event);
    alert(`Evento: ${event.title}\n${event.description || 'Sem descrição'}`);
  }
  
  addEvent(): void {
    if (this.newEventTitle && this.newEventDate) {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title: this.newEventTitle,
        date: new Date(this.newEventDate),
        color: this.getRandomColor()
      };
      this.myEvents = [...this.myEvents, newEvent];
      this.newEventTitle = '';
      this.newEventDate = '';
    }
  }
  
  private getRandomColor(): string {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
