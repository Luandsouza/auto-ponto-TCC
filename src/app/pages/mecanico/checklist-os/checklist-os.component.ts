import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OrdemServico, ServicoOrdem } from '../../../models/ordem-servico';
import { OrdemServicoService } from '../../../service/ordem-servico.service';

@Component({
  selector: 'app-checklist-os',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './checklist-os.component.html',
  styleUrls: ['./checklist-os.component.css'],
})
export class ChecklistOsComponent implements OnInit {
  ordensServico: OrdemServico[] = [];
  ordem?: OrdemServico;
  osSelecionada = '';
  tecnicoAtual = 'Mecânico Auto Ponto';
  erro = '';
  codigoArrastado = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordemServicoService: OrdemServicoService,
  ) {}

  ngOnInit(): void {
    this.ordemServicoService.ordens$.subscribe(ordens => {
      this.ordensServico = ordens;
      const idRota = Number(this.route.snapshot.paramMap.get('id'));
      if (idRota) {
        this.osSelecionada = String(idRota);
        this.carregarChecklist();
      }
    });
  }

  get checklistItens(): ServicoOrdem[] {
    return (this.ordem?.servicosCatalogo || [])
      .filter(servico => ['aprovado', 'em execução', 'concluído'].includes(servico.status))
      .sort((a, b) => a.ordem - b.ordem);
  }

  get percentualConcluido(): number {
    if (!this.checklistItens.length) {
      return 0;
    }
    const concluidos = this.checklistItens.filter(item => item.status === 'concluído').length;
    return Math.round((concluidos / this.checklistItens.length) * 100);
  }

  carregarChecklist(): void {
    const id = Number(this.osSelecionada);
    this.ordem = id ? this.ordemServicoService.buscarOrdemPorId(id) : undefined;
    this.erro = '';
  }

  iniciar(servico: ServicoOrdem): void {
    this.alterarStatus(servico, 'em execução');
  }

  concluir(servico: ServicoOrdem): void {
    this.alterarStatus(servico, 'concluído');
    if (this.erro) {
      return;
    }
    if (confirm('Deseja gerar nota de serviço ou baixar relatório parcial?')) {
      alert(`Relatório parcial gerado para ${servico.nome}.`);
    }
  }

  salvarObservacao(servico: ServicoOrdem): void {
    if (!this.ordem) {
      return;
    }
    this.ordem = this.ordemServicoService.atualizarObservacaoServico(
      this.ordem.id,
      servico.codigo,
      servico.observacao || '',
      this.tecnicoAtual,
    );
  }

  adicionarAnexo(servico: ServicoOrdem, valor: string): void {
    if (!this.ordem || !valor.trim()) {
      return;
    }
    servico.anexos = [...(servico.anexos || []), valor.trim()];
    this.ordem = this.ordemServicoService.atualizarObservacaoServico(
      this.ordem.id,
      servico.codigo,
      servico.observacao || '',
      this.tecnicoAtual,
    );
  }

  mover(servico: ServicoOrdem, direcao: -1 | 1): void {
    if (!this.ordem) {
      return;
    }
    this.ordem = this.ordemServicoService.moverServicoChecklist(
      this.ordem.id,
      servico.codigo,
      direcao,
      this.tecnicoAtual,
    );
  }

  iniciarArraste(servico: ServicoOrdem): void {
    this.codigoArrastado = servico.codigo;
  }

  soltarSobre(destino: ServicoOrdem): void {
    if (!this.ordem || !this.codigoArrastado || this.codigoArrastado === destino.codigo) {
      this.codigoArrastado = '';
      return;
    }

    const codigos = this.checklistItens.map(item => item.codigo);
    const origem = codigos.indexOf(this.codigoArrastado);
    const destinoIndex = codigos.indexOf(destino.codigo);
    if (origem < 0 || destinoIndex < 0) {
      this.codigoArrastado = '';
      return;
    }

    const [movido] = codigos.splice(origem, 1);
    codigos.splice(destinoIndex, 0, movido);
    this.ordem = this.ordemServicoService.reordenarServicosChecklist(
      this.ordem.id,
      codigos,
      this.tecnicoAtual,
    );
    this.codigoArrastado = '';
  }

  private alterarStatus(servico: ServicoOrdem, status: 'em execução' | 'concluído'): void {
    if (!this.ordem) {
      return;
    }
    const resultado = this.ordemServicoService.alterarStatusServico(
      this.ordem.id,
      servico.codigo,
      status,
      this.tecnicoAtual,
    );
    if (resultado.erro) {
      this.erro = resultado.erro;
      return;
    }
    this.erro = '';
    this.ordem = resultado.ordem;
  }
}
