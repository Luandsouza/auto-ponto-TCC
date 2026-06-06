import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarEvent {
  id?: string | number;
  title: string;
  date: Date;
  color?: string;
  description?: string;
}

interface CalendarDay {
  date: Date;
  isOtherMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarComponent implements OnInit {
  @Input() events: CalendarEvent[] = [];
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() eventClicked = new EventEmitter<CalendarEvent>();

  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: CalendarDay[] = [];

  get currentYear(): number {
    return this.currentDate.getFullYear();
  }

  get currentMonth(): number {
    return this.currentDate.getMonth();
  }

  get currentMonthName(): string {
    return this.currentDate.toLocaleString('pt-BR', { month: 'long' });
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const currentDay = new Date(date);
      const isOtherMonth = currentDay.getMonth() !== this.currentMonth;
      const isToday = !isOtherMonth && this.isSameDate(currentDay, today);
      
      this.calendarDays.push({
        date: currentDay,
        isOtherMonth,
        isToday,
        events: []
      });
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.dateSelected.emit(date);
  }

  getEventsForDate(date: Date): CalendarEvent[] {
    return this.events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  }

  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  onEventClick(event: CalendarEvent, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation();
    this.eventClicked.emit(event);
  }
}