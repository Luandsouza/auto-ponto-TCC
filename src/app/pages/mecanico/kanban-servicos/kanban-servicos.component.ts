import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ServicoKanban {
  id: number;
  titulo: string;
  descricao: string;
  cliente: string;
  veiculo: string;
  prioridade: 'Baixa' | 'Média' | 'Alta';
  responsavel: string;
  dataCriacao: Date;
  prazo: Date;
  status: 'a-fazer' | 'em-andamento' | 'revisao' | 'concluido';
}

@Component({
  selector: 'app-kanban-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './kanban-servicos.component.html',
  styleUrls: ['./kanban-servicos.component.css']
})
export class KanbanServicosComponent implements OnInit {
  servicos: ServicoKanban[] = [];
  
  colunas = [
    { id: 'a-fazer', titulo: '📋 A Fazer', itens: [] as ServicoKanban[] },
    { id: 'em-andamento', titulo: '⚙️ Em Andamento', itens: [] as ServicoKanban[] },
    { id: 'revisao', titulo: '🔍 Em Revisão', itens: [] as ServicoKanban[] },
    { id: 'concluido', titulo: '✅ Concluído', itens: [] as ServicoKanban[] }
  ];

  modalAberto: boolean = false;
  editando: boolean = false;
  servicoAtual: Partial<ServicoKanban> = {};
  prioridades = ['Baixa', 'Média', 'Alta'];

  ngOnInit() {
    this.carregarKanban();
  }

  carregarKanban() {
    const saved = localStorage.getItem('kanban_servicos');
    if (saved) {
      this.servicos = JSON.parse(saved, (key, value) => {
        if (key === 'dataCriacao' || key === 'prazo') {
          return value ? new Date(value) : null;
        }
        return value;
      });
      this.organizarColunas();
    } else {
      this.servicos = [
        {
          id: 1,
          titulo: 'Troca de óleo',
          descricao: 'Troca de óleo e filtro',
          cliente: 'João Silva',
          veiculo: 'Honda Civic',
          prioridade: 'Alta',
          responsavel: 'Carlos',
          dataCriacao: new Date(),
          prazo: new Date(Date.now() + 2*24*60*60*1000),
          status: 'a-fazer'
        },
        {
          id: 2,
          titulo: 'Revisão completa',
          descricao: 'Revisão de 20.000km',
          cliente: 'Maria Santos',
          veiculo: 'Toyota Corolla',
          prioridade: 'Média',
          responsavel: 'André',
          dataCriacao: new Date(),
          prazo: new Date(Date.now() + 5*24*60*60*1000),
          status: 'em-andamento'
        }
      ];
      this.salvarKanban();
      this.organizarColunas();
    }
  }

  organizarColunas() {
    this.colunas.forEach(coluna => coluna.itens = []);
    
    this.servicos.forEach(servico => {
      const coluna = this.colunas.find(c => c.id === servico.status);
      if (coluna) {
        coluna.itens.push(servico);
      }
    });
  }

  salvarKanban() {
    localStorage.setItem('kanban_servicos', JSON.stringify(this.servicos));
  }

  moverServico(servico: ServicoKanban, novoStatus: string) {
    const index = this.servicos.findIndex(s => s.id === servico.id);
    if (index !== -1) {
      this.servicos[index].status = novoStatus as any;
      this.salvarKanban();
      this.organizarColunas();
    }
  }

  moverParaProxima(servico: ServicoKanban) {
    const ordem = ['a-fazer', 'em-andamento', 'revisao', 'concluido'];
    const indiceAtual = ordem.indexOf(servico.status);
    if (indiceAtual < ordem.length - 1) {
      this.moverServico(servico, ordem[indiceAtual + 1]);
    }
  }

  moverParaAnterior(servico: ServicoKanban) {
    const ordem = ['a-fazer', 'em-andamento', 'revisao', 'concluido'];
    const indiceAtual = ordem.indexOf(servico.status);
    if (indiceAtual > 0) {
      this.moverServico(servico, ordem[indiceAtual - 1]);
    }
  }

  novoServico() {
    this.editando = false;
    this.servicoAtual = {
      prioridade: 'Média',
      dataCriacao: new Date(),
      status: 'a-fazer'
    };
    this.modalAberto = true;
  }

  editarServico(servico: ServicoKanban) {
    this.editando = true;
    this.servicoAtual = { ...servico };
    this.modalAberto = true;
  }

  salvarServico() {
    if (this.editando && this.servicoAtual.id) {
      const index = this.servicos.findIndex(s => s.id === this.servicoAtual.id);
      if (index !== -1) {
        this.servicos[index] = { ...this.servicoAtual as ServicoKanban };
      }
    } else {
      const novoServico = {
        ...this.servicoAtual,
        id: Date.now()
      } as ServicoKanban;
      this.servicos.push(novoServico);
    }
    this.salvarKanban();
    this.organizarColunas();
    this.fecharModal();
  }

  excluirServico(servico: ServicoKanban) {
    if (confirm(`Tem certeza que deseja excluir "${servico.titulo}"?`)) {
      this.servicos = this.servicos.filter(s => s.id !== servico.id);
      this.salvarKanban();
      this.organizarColunas();
    }
  }

  getPrioridadeClass(prioridade: string): string {
    switch(prioridade) {
      case 'Alta': return 'prioridade-alta';
      case 'Média': return 'prioridade-media';
      case 'Baixa': return 'prioridade-baixa';
      default: return '';
    }
  }

  fecharModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
      this.servicoAtual = {};
    }
  }
}