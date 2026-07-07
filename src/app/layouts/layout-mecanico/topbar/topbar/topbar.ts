import { Component } from '@angular/core';

@Component({
  selector: 'app-topbar',
  imports: [],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  get notificacoesPendentes(): number {
    try {
      const notificacoes = JSON.parse(localStorage.getItem('notificacoes_oficina') || '[]');
      return notificacoes.filter((item: { lida?: boolean }) => !item.lida).length;
    } catch {
      return 0;
    }
  }
}
