import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChecklistItem {
  id: number;
  descricao: string;
  concluido: boolean;
  observacao?: string;
}

interface OrdemServicoChecklist {
  numero: string;
  itens: ChecklistItem[];
}

@Component({
  selector: 'app-checklist-os',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist-os.component.html',
  styleUrls: ['./checklist-os.component.css']
})
export class ChecklistOsComponent implements OnInit {
  ordensServico: any[] = [];
  checklistData: OrdemServicoChecklist[] = [];
  osSelecionada: string = '';
  checklistItens: ChecklistItem[] = [];
  modalAberto: boolean = false;
  novoItemDescricao: string = '';

  ngOnInit() {
    this.carregarOrdensServico();
    this.carregarChecklistData();
  }

  carregarOrdensServico() {
    const saved = localStorage.getItem('ordens_servico');
    if (saved) {
      this.ordensServico = JSON.parse(saved);
    }
  }

  carregarChecklistData() {
    const saved = localStorage.getItem('checklist_os');
    if (saved) {
      this.checklistData = JSON.parse(saved);
    }
  }

  salvarChecklistData() {
    localStorage.setItem('checklist_os', JSON.stringify(this.checklistData));
  }

  carregarChecklist() {
    if (!this.osSelecionada) {
      this.checklistItens = [];
      return;
    }

    const existing = this.checklistData.find(c => c.numero === this.osSelecionada);
    if (existing) {
      this.checklistItens = existing.itens;
    } else {
      this.checklistItens = [];
      this.checklistData.push({ numero: this.osSelecionada, itens: [] });
      this.salvarChecklistData();
    }
  }

  get percentualConcluido(): number {
    if (this.checklistItens.length === 0) return 0;
    const concluidos = this.checklistItens.filter(item => item.concluido).length;
    return Math.round((concluidos / this.checklistItens.length) * 100);
  }

  salvarChecklist() {
    const index = this.checklistData.findIndex(c => c.numero === this.osSelecionada);
    if (index !== -1) {
      this.checklistData[index].itens = this.checklistItens;
    }
    this.salvarChecklistData();
  }

  novaChecklist() {
    this.modalAberto = true;
  }

  adicionarItem() {
    if (this.novoItemDescricao.trim()) {
      const novoItem: ChecklistItem = {
        id: Date.now(),
        descricao: this.novoItemDescricao,
        concluido: false,
        observacao: ''
      };
      this.checklistItens.push(novoItem);
      this.salvarChecklist();
      this.fecharModal();
    }
  }

  excluirItem(id: number) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      this.checklistItens = this.checklistItens.filter(item => item.id !== id);
      this.salvarChecklist();
    }
  }

  fecharModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
      this.novoItemDescricao = '';
    }
  }
}