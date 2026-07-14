import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AgendamentoCliente } from '../../../models/agendamento-cliente';
import { OrdemServico, clientePodeCancelar } from '../../../models/ordem-servico';
import { OrdemServicoService } from '../../../service/ordem-servico.service';

@Component({
  selector: 'app-status-servicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-servicos.html',
  styleUrl: './status-servicos.css',
})
export class StatusServicos implements OnInit {
  atendimentos: AgendamentoCliente[] = [];
  ordens: OrdemServico[] = [];

  constructor(private readonly ordemServicoService: OrdemServicoService) {}

  ngOnInit() {
    this.ordemServicoService.sincronizarSolicitacoes();
    this.ordemServicoService.agendamentos$.subscribe(
      atendimentos => (this.atendimentos = atendimentos),
    );
    this.ordemServicoService.ordens$.subscribe(ordens => (this.ordens = ordens));
  }

  ordemDoAtendimento(atendimento: AgendamentoCliente): OrdemServico | undefined {
    return this.ordens.find(
      ordem =>
        ordem.id === atendimento.ordemServicoId ||
        ordem.agendamentoId === atendimento.id,
    );
  }

  podeCancelar(atendimento: AgendamentoCliente): boolean {
    const ordem = this.ordemDoAtendimento(atendimento);
    return ordem ? clientePodeCancelar(ordem.status) : atendimento.status !== 'Cancelado';
  }

  cancelar(atendimento: AgendamentoCliente): void {
    if (
      this.podeCancelar(atendimento) &&
      confirm('Deseja cancelar esta ordem de serviço?')
    ) {
      this.ordemServicoService.cancelarPeloCliente(atendimento.id);
    }
  }

  responderOrcamento(atendimento: AgendamentoCliente, aprovado: boolean): void {
    this.ordemServicoService.responderOrcamento(atendimento.id, aprovado);
  }
}
