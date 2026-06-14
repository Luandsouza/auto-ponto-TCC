import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  time?: string;
  color?: string;
  description?: string;
  cliente?: string;
  veiculo?: string;
  tipo?: 'servico' | 'reuniao' | 'lembrete' | 'entrega';
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {
  // Data atual
  currentDate: Date = new Date();
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  
  // Dias do mês
  daysInMonth: Date[] = [];
  weekDays: string[] = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  // Eventos
  events: CalendarEvent[] = [];
  selectedDate: Date | null = null;
  eventsForSelectedDate: CalendarEvent[] = [];
  
  // Modal
  modalAberto: boolean = false;
  editando: boolean = false;
  eventAtual: Partial<CalendarEvent> = {};
  
  // Filtros
  filtroTipo: string = '';
  tipos = ['todos', 'servico', 'reuniao', 'lembrete', 'entrega'];
  
  // Cores para eventos
  colorOptions = [
    { nome: 'Azul', valor: '#3498db' },
    { nome: 'Verde', valor: '#2ecc71' },
    { nome: 'Vermelho', valor: '#e74c3c' },
    { nome: 'Amarelo', valor: '#f39c12' },
    { nome: 'Roxo', valor: '#9b59b6' },
    { nome: 'Laranja', valor: '#e67e22' }
  ];

  constructor() {}

  ngOnInit() {
    this.carregarEventos();
    this.generateCalendar();
  }

  carregarEventos() {
    const saved = localStorage.getItem('calendario_eventos');
    if (saved) {
      this.events = JSON.parse(saved, (key, value) => {
        if (key === 'date') {
          return value ? new Date(value) : null;
        }
        return value;
      });
    } else {
      // Dados de exemplo
      this.events = [
        {
          id: 1,
          title: 'Troca de óleo - Civic',
          date: new Date(this.currentYear, this.currentMonth, 5),
          time: '10:00',
          color: '#3498db',
          description: 'Troca de óleo e filtro',
          cliente: 'João Silva',
          veiculo: 'Honda Civic',
          tipo: 'servico'
        },
        {
          id: 2,
          title: 'Reunião de equipe',
          date: new Date(this.currentYear, this.currentMonth, 10),
          time: '14:00',
          color: '#9b59b6',
          description: 'Alinhamento semanal',
          tipo: 'reuniao'
        },
        {
          id: 3,
          title: 'Revisão - Corolla',
          date: new Date(this.currentYear, this.currentMonth, 15),
          time: '09:00',
          color: '#e74c3c',
          description: 'Revisão completa 20.000km',
          cliente: 'Maria Santos',
          veiculo: 'Toyota Corolla',
          tipo: 'servico'
        },
        {
          id: 4,
          title: 'Entrega de peças',
          date: new Date(this.currentYear, this.currentMonth, 20),
          time: '11:00',
          color: '#f39c12',
          description: 'Entrega de peças do fornecedor',
          tipo: 'entrega'
        },
        {
          id: 5,
          title: 'Aniversário cliente',
          date: new Date(this.currentYear, this.currentMonth, 25),
          time: '08:00',
          color: '#2ecc71',
          description: 'Ligar para cliente de aniversário',
          cliente: 'Carlos Lima',
          tipo: 'lembrete'
        }
      ];
      this.salvarEventos();
    }
  }

  salvarEventos() {
    localStorage.setItem('calendario_eventos', JSON.stringify(this.events));
  }

  generateCalendar() {
    this.daysInMonth = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Dias do mês anterior para completar a primeira semana
    const firstDayWeekday = firstDayOfMonth.getDay();
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay - i);
      this.daysInMonth.push(date);
    }
    
    // Dias do mês atual
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.daysInMonth.push(date);
    }
    
    // Dias do próximo mês para completar 42 dias (6 linhas)
    const remainingDays = 42 - this.daysInMonth.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.daysInMonth.push(date);
    }
  }

  getEventsForDay(date: Date): CalendarEvent[] {
    let eventos = this.events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
    
    if (this.filtroTipo && this.filtroTipo !== 'todos') {
      eventos = eventos.filter(e => e.tipo === this.filtroTipo);
    }
    
    return eventos;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth;
  }

  selecionarData(date: Date) {
    this.selectedDate = date;
    this.eventsForSelectedDate = this.getEventsForDay(date);
  }

  proximoMes() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  mesAnterior() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  voltarHoje() {
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  novoEvento() {
    this.editando = false;
    this.eventAtual = {
      date: this.selectedDate || new Date(),
      color: '#3498db',
      tipo: 'servico'
    };
    this.modalAberto = true;
  }

  editarEvento(event: CalendarEvent) {
    this.editando = true;
    this.eventAtual = { ...event };
    this.modalAberto = true;
  }

  salvarEvento() {
    if (this.editando && this.eventAtual.id) {
      const index = this.events.findIndex(e => e.id === this.eventAtual.id);
      if (index !== -1) {
        this.events[index] = { ...this.eventAtual as CalendarEvent };
      }
    } else {
      const novoEvento = {
        ...this.eventAtual,
        id: Date.now()
      } as CalendarEvent;
      this.events.push(novoEvento);
    }
    this.salvarEventos();
    this.fecharModal();
    if (this.selectedDate) {
      this.eventsForSelectedDate = this.getEventsForDay(this.selectedDate);
    }
  }

  excluirEvento(id: number) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.events = this.events.filter(e => e.id !== id);
      this.salvarEventos();
      if (this.selectedDate) {
        this.eventsForSelectedDate = this.getEventsForDay(this.selectedDate);
      }
    }
  }

  fecharModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
      this.eventAtual = {};
    }
  }

  getTipoIcon(tipo: string): string {
    switch(tipo) {
      case 'servico': return '🔧';
      case 'reuniao': return '👥';
      case 'lembrete': return '📝';
      case 'entrega': return '🚚';
      default: return '📌';
    }
  }

  getTipoLabel(tipo: string): string {
    switch(tipo) {
      case 'servico': return 'Serviço';
      case 'reuniao': return 'Reunião';
      case 'lembrete': return 'Lembrete';
      case 'entrega': return 'Entrega';
      default: return 'Evento';
    }
  }
}