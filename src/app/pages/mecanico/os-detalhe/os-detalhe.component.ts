import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  CategoriaServicoOS,
  OrdemServico,
  ServicoOrdem,
  StatusServicoOS,
  TipoDescontoOS,
} from '../../../models/ordem-servico';
import { OrdemServicoService } from '../../../service/ordem-servico.service';

@Component({
  selector: 'app-os-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './os-detalhe.component.html',
  styleUrl: './os-detalhe.component.css',
})
export class OsDetalheComponent implements OnInit {
  ordem?: OrdemServico;
  busca = '';
  categoria = 'todas';
  escolhaCliente = false;
  selecionados = new Set<string>();
  pagina = 1;
  readonly itensPorPagina = 20;
  readonly impostoPercentual = 8;
  readonly usuarioAtual = 'Atendente Auto Ponto';
  readonly categorias: Array<CategoriaServicoOS | 'todas'> = [
    'todas',
    'Revisão',
    'Motor',
    'Freios',
    'Suspensão',
    'Elétrica',
    'Pneus',
    'Ar-condicionado',
    'Diagnóstico',
  ];
  readonly statusServico: StatusServicoOS[] = [
    'pendente',
    'aguardando aprovação',
    'aprovado',
    'em execução',
    'concluído',
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordemServicoService: OrdemServicoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarOrdem(id);
  }

  get servicos(): ServicoOrdem[] {
    return (this.ordem?.servicosCatalogo || []).slice().sort((a, b) => a.ordem - b.ordem);
  }

  get servicosFiltrados(): ServicoOrdem[] {
    const termo = this.busca.trim().toLowerCase();
    return this.servicos.filter(servico => {
      const correspondeCategoria = this.categoria === 'todas' || servico.categoria === this.categoria;
      const correspondeTexto =
        !termo ||
        [servico.codigo, servico.nome, servico.descricao, servico.categoria]
          .some(valor => valor.toLowerCase().includes(termo));
      return correspondeCategoria && correspondeTexto;
    });
  }

  get servicosPaginados(): ServicoOrdem[] {
    if (!this.mostrarPaginacao) {
      return this.servicosFiltrados;
    }
    const inicio = (this.pagina - 1) * this.itensPorPagina;
    return this.servicosFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get mostrarPaginacao(): boolean {
    return this.servicosFiltrados.length > this.itensPorPagina;
  }

  get totalPaginas(): number {
    return Math.ceil(this.servicosFiltrados.length / this.itensPorPagina);
  }

  get subtotal(): number {
    return this.servicos
      .filter(servico => this.selecionados.has(servico.codigo))
      .reduce((total, servico) => total + this.valorComDesconto(servico), 0);
  }

  get impostos(): number {
    return this.subtotal * (this.impostoPercentual / 100);
  }

  get total(): number {
    return this.subtotal + this.impostos;
  }

  get temServicoAprovado(): boolean {
    return this.servicos.some(servico =>
      ['aprovado', 'em execução', 'concluído'].includes(servico.status),
    );
  }

  get temPropostaPendente(): boolean {
    return this.servicos.some(servico => servico.status === 'aguardando aprovação');
  }

  alternarSelecao(servico: ServicoOrdem, selecionado: boolean): void {
    if (!this.escolhaCliente || servico.status !== 'pendente') {
      return;
    }
    if (selecionado) {
      this.selecionados.add(servico.codigo);
    } else {
      this.selecionados.delete(servico.codigo);
    }
  }

  confirmarEscolha(modo: 'cliente' | 'atendente'): void {
    if (!this.ordem || !this.selecionados.size) {
      return;
    }
    this.ordem = this.ordemServicoService.confirmarEscolhaServicos(
      this.ordem.id,
      Array.from(this.selecionados),
      modo,
      modo === 'cliente' ? 'Cliente Auto Ponto' : this.usuarioAtual,
    );
    this.selecionados.clear();
    this.escolhaCliente = false;
  }

  responderProposta(servico: ServicoOrdem, aprovado: boolean): void {
    if (!this.ordem) {
      return;
    }
    this.ordem = this.ordemServicoService.responderPropostaServico(
      this.ordem.id,
      servico.codigo,
      aprovado,
      'Cliente Auto Ponto',
    );
  }

  aplicarDesconto(servico: ServicoOrdem): void {
    if (!this.ordem) {
      return;
    }
    const descontoValor = Number(servico.descontoValor) || 0;
    const exigeJustificativa = servico.descontoTipo === 'percentual'
      ? descontoValor > 10
      : descontoValor > servico.precoUnitario * 0.1;
    if (exigeJustificativa && !servico.descontoJustificativa?.trim()) {
      alert('Informe uma justificativa para descontos acima de 10.');
      return;
    }

    this.ordem = this.ordemServicoService.aplicarDescontoServico(
      this.ordem.id,
      servico.codigo,
      servico.descontoTipo || 'valor',
      descontoValor,
      servico.descontoJustificativa || '',
      this.usuarioAtual,
    );
  }

  salvarObservacao(servico: ServicoOrdem): void {
    if (!this.ordem) {
      return;
    }
    this.ordem = this.ordemServicoService.atualizarObservacaoServico(
      this.ordem.id,
      servico.codigo,
      servico.observacao || '',
      this.usuarioAtual,
    );
  }

  alterarStatus(servico: ServicoOrdem, status: StatusServicoOS): void {
    if (!this.ordem || servico.status === status) {
      return;
    }
    const resultado = this.ordemServicoService.alterarStatusServico(
      this.ordem.id,
      servico.codigo,
      status,
      this.usuarioAtual,
    );
    if (resultado.erro) {
      alert(resultado.erro);
      return;
    }
    this.ordem = resultado.ordem;
  }

  proximaPagina(): void {
    this.pagina = Math.min(this.pagina + 1, this.totalPaginas);
  }

  paginaAnterior(): void {
    this.pagina = Math.max(this.pagina - 1, 1);
  }

  resetarPagina(): void {
    this.pagina = 1;
  }

  valorComDesconto(servico: ServicoOrdem): number {
    const desconto = this.valorDesconto(servico);
    return Math.max(servico.precoUnitario - desconto, 0);
  }

  private valorDesconto(servico: ServicoOrdem): number {
    if (!servico.descontoValor) {
      return 0;
    }
    return servico.descontoTipo === 'percentual'
      ? servico.precoUnitario * (servico.descontoValor / 100)
      : servico.descontoValor;
  }

  private carregarOrdem(id: number): void {
    this.ordem = this.ordemServicoService.buscarOrdemPorId(id);
    for (const servico of this.servicos) {
      if (servico.selecionado && servico.status === 'pendente') {
        this.selecionados.add(servico.codigo);
      }
      servico.descontoTipo ||= 'valor' as TipoDescontoOS;
    }
  }
}
