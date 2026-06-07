import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface OrdemServicoComponent {
  id: number;
  numero: string;
  cliente: string;
  veiculo: string;
  placa: string;
  dataAbertura: Date;
  dataPrevisao: Date;
  status: 'Aberta' | 'Em Andamento' | 'Aguardando Peças' | 'Concluída' | 'Cancelada';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  servicos: string[];
  valorTotal: number;
  observacoes: string;
}

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './ordens-servico.component.html',
  styleUrls: ['./ordens-servico.component.css']
})
export class OrdensServicoComponent implements OnInit {
  ordensServico: OrdemServicoComponent[] = [];
  osFiltradas: OrdemServicoComponent[] = [];
  filtro: string = '';
  filtroStatus: string = '';
  filtroPrioridade: string = '';
  modalAberto: boolean = false;
  editando: boolean = false;
  osAtual: Partial<OrdemServicoComponent> = {};
  
  statusList = ['Aberta', 'Em Andamento', 'Aguardando Peças', 'Concluída', 'Cancelada'];
  prioridadeList = ['Baixa', 'Média', 'Alta', 'Urgente'];

  ngOnInit() {
    this.carregarOS();
  }

  carregarOS() {
    const saved = localStorage.getItem('ordens_servico');
    if (saved) {
      this.ordensServico = JSON.parse(saved);
    } else {
      this.ordensServico = [
        {
          id: 1,
          numero: 'OS-001',
          cliente: 'João Silva',
          veiculo: 'Honda Civic',
          placa: 'ABC1234',
          dataAbertura: new Date(),
          dataPrevisao: new Date(Date.now() + 7*24*60*60*1000),
          status: 'Em Andamento',
          prioridade: 'Alta',
          servicos: ['Troca de óleo', 'Revisão completa'],
          valorTotal: 850,
          observacoes: 'Cliente solicitou urgência'
        },
        {
          id: 2,
          numero: 'OS-002',
          cliente: 'Maria Santos',
          veiculo: 'Toyota Corolla',
          placa: 'XYZ5678',
          dataAbertura: new Date(),
          dataPrevisao: new Date(Date.now() + 3*24*60*60*1000),
          status: 'Aberta',
          prioridade: 'Urgente',
          servicos: ['Troca de pastilhas de freio', 'Alinhamento'],
          valorTotal: 450,
          observacoes: ''
        }
      ];
      this.salvarLocalStorage();
    }
    this.filtrarOS();
  }

  salvarLocalStorage() {
    localStorage.setItem('ordens_servico', JSON.stringify(this.ordensServico));
  }

  filtrarOS() {
    this.osFiltradas = this.ordensServico.filter(os => {
      const matchTexto = !this.filtro || 
        os.cliente.toLowerCase().includes(this.filtro.toLowerCase()) ||
        os.veiculo.toLowerCase().includes(this.filtro.toLowerCase()) ||
        os.placa.toLowerCase().includes(this.filtro.toLowerCase());
      
      const matchStatus = !this.filtroStatus || os.status === this.filtroStatus;
      const matchPrioridade = !this.filtroPrioridade || os.prioridade === this.filtroPrioridade;
      
      return matchTexto && matchStatus && matchPrioridade;
    });
  }

  novaOS() {
    this.editando = false;
    this.osAtual = {
      numero: `OS-${String(this.ordensServico.length + 1).padStart(3, '0')}`,
      dataAbertura: new Date(),
      status: 'Aberta',
      prioridade: 'Média',
      servicos: [],
      valorTotal: 0
    };
    this.modalAberto = true;
  }

  editarOS(os: OrdemServicoComponent) {
    this.editando = true;
    this.osAtual = { ...os };
    this.modalAberto = true;
  }

  verDetalhes(os: OrdemServicoComponent) {
    alert(`OS: ${os.numero}\nCliente: ${os.cliente}\nVeículo: ${os.veiculo}\nServiços: ${os.servicos.join(', ')}\nValor: R$ ${os.valorTotal}`);
  }

  salvarOS() {
    if (this.editando && this.osAtual.id) {
      const index = this.ordensServico.findIndex(os => os.id === this.osAtual.id);
      if (index !== -1) {
        this.ordensServico[index] = { ...this.osAtual as OrdemServicoComponent };
      }
    } else {
      const novaOS = {
        ...this.osAtual,
        id: Date.now(),
        dataAbertura: new Date()
      } as OrdemServicoComponent;
      this.ordensServico.push(novaOS);
    }
    this.salvarLocalStorage();
    this.carregarOS();
    this.fecharModal();
  }

  excluirOS(id: number) {
    if (confirm('Tem certeza que deseja excluir esta OS?')) {
      this.ordensServico = this.ordensServico.filter(os => os.id !== id);
      this.salvarLocalStorage();
      this.carregarOS();
    }
  }

  fecharModal(event?: MouseEvent) {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
      this.osAtual = {};
    }
  }
}