import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  OrdemServico,
  PrioridadeOrdem,
  STATUS_EMPRESA,
  StatusEmpresa,
} from '../../../models/ordem-servico';
import { OrdemServicoService } from '../../../service/ordem-servico.service';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './ordens-servico.component.html',
  styleUrls: ['./ordens-servico.component.css'],
})
export class OrdensServicoComponent implements OnInit {
  ordensServico: OrdemServico[] = [];
  osFiltradas: OrdemServico[] = [];
  filtro = '';
  filtroStatus = '';
  filtroPrioridade = '';
  modalAberto = false;
  editando = false;
  osAtual: Partial<OrdemServico> = {};

  readonly statusList = STATUS_EMPRESA;
  readonly prioridadeList: PrioridadeOrdem[] = ['Baixa', 'Média', 'Alta', 'Urgente'];

  constructor(private readonly ordemServicoService: OrdemServicoService) {}

  ngOnInit(): void {
    this.ordemServicoService.sincronizarSolicitacoes();
    this.ordemServicoService.ordens$.subscribe(ordens => {
      this.ordensServico = ordens;
      this.filtrarOS();
    });
  }

  filtrarOS(): void {
    const termo = this.filtro.toLowerCase();
    this.osFiltradas = this.ordensServico.filter(os => {
      const correspondeAoTexto =
        !termo ||
        os.cliente.toLowerCase().includes(termo) ||
        os.veiculo.toLowerCase().includes(termo) ||
        os.placa.toLowerCase().includes(termo) ||
        os.numero.toLowerCase().includes(termo);
      const correspondeAoStatus = !this.filtroStatus || os.status === this.filtroStatus;
      const correspondeAPrioridade =
        !this.filtroPrioridade || os.prioridade === this.filtroPrioridade;

      return correspondeAoTexto && correspondeAoStatus && correspondeAPrioridade;
    });
  }

  novaOS(): void {
    const agora = new Date();
    this.editando = false;
    this.osAtual = {
      numero: this.proximoNumeroOS(),
      dataAbertura: agora.toISOString(),
      dataPrevisao: agora.toISOString().slice(0, 10),
      status: 'Aguardando Orçamento',
      prioridade: 'Média',
      servicos: [],
      valorTotal: 0,
      observacoes: '',
    };
    this.modalAberto = true;
  }

  editarOS(os: OrdemServico): void {
    this.editando = true;
    this.osAtual = {
      ...os,
      dataPrevisao: os.dataPrevisao.slice(0, 10),
      servicos: [...os.servicos],
    };
    this.modalAberto = true;
  }

  temServicoAprovado(os: OrdemServico): boolean {
    return !!os.servicosCatalogo?.some(servico =>
      ['aprovado', 'em execução', 'concluído'].includes(servico.status),
    );
  }

  temPropostaPendente(os: OrdemServico): boolean {
    return !!os.servicosCatalogo?.some(servico => servico.status === 'aguardando aprovação');
  }

  salvarOS(): void {
    const agora = new Date().toISOString();
    const ordem: OrdemServico = {
      id: this.osAtual.id ?? Date.now(),
      numero: this.osAtual.numero || this.proximoNumeroOS(),
      cliente: this.osAtual.cliente || '',
      veiculo: this.osAtual.veiculo || '',
      placa: this.osAtual.placa || '',
      dataAbertura: this.osAtual.dataAbertura || agora,
      dataPrevisao: this.normalizarData(this.osAtual.dataPrevisao),
      status: this.osAtual.status || 'Aguardando Orçamento',
      prioridade: this.osAtual.prioridade || 'Média',
      servicos: this.osAtual.servicos || [],
      valorTotal: Number(this.osAtual.valorTotal) || 0,
      observacoes: this.osAtual.observacoes || '',
      agendamentoId: this.osAtual.agendamentoId,
      atualizadoEm: agora,
    };

    this.ordemServicoService.salvarOrdem(ordem);
    this.fecharModal();
  }

  excluirOS(id: number): void {
    if (confirm('Tem certeza que deseja cancelar/excluir esta OS?')) {
      this.ordemServicoService.excluirOrdem(id);
    }
  }

  atualizarStatus(os: OrdemServico, status: StatusEmpresa): void {
    this.ordemServicoService.atualizarStatus(os.id, status);
  }

  enviarOrcamento(os: OrdemServico): void {
    if (os.valorTotal <= 0) {
      alert('Informe o valor do orçamento antes de enviá-lo ao cliente.');
      return;
    }
    this.ordemServicoService.enviarOrcamento(os.id);
  }

  podeEnviarOrcamento(os: OrdemServico): boolean {
    return (
      !!os.agendamentoId &&
      os.valorTotal > 0 &&
      ['Aguardando Orçamento', 'Orçamento em Execução'].includes(os.status)
    );
  }

  atualizarServicos(valor: string): void {
    this.osAtual.servicos = valor
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  classeStatus(status: StatusEmpresa): string {
    const classes: Record<StatusEmpresa, string> = {
      'Aguardando Orçamento': 'status-aguardando-orcamento',
      'Orçamento em Execução': 'status-orcamento-execucao',
      'Aguardando Aprovação': 'status-aguardando-aprovacao',
      'Aguardando Execução': 'status-aguardando-execucao',
      'Em Execução': 'status-em-execucao',
      Finalizado: 'status-finalizado',
      Cancelado: 'status-cancelado',
    };
    return classes[status];
  }

  fecharModal(event?: MouseEvent): void {
    if (!event || event.target === event.currentTarget) {
      this.modalAberto = false;
      this.osAtual = {};
    }
  }

  private proximoNumeroOS(): string {
    const maiorNumero = this.ordensServico.reduce((maior, os) => {
      const numero = Number(os.numero.replace(/\D/g, ''));
      return Math.max(maior, Number.isNaN(numero) ? 0 : numero);
    }, 0);
    return `OS-${String(maiorNumero + 1).padStart(3, '0')}`;
  }

  private normalizarData(data?: string): string {
    return data ? new Date(`${data.slice(0, 10)}T12:00:00`).toISOString() : new Date().toISOString();
  }
}
