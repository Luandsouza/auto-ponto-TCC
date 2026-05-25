import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  AtualizacaoPeca,
  MovimentacaoEstoque,
  NovaPeca,
  Peca,
  TipoMovimentacaoEstoque,
} from '../models/peca';

@Injectable({
  providedIn: 'root',
})
export class EstoquePecasService {
  private readonly pecasStorageKey = 'auto-ponto-pecas';
  private readonly movimentacoesStorageKey = 'auto-ponto-movimentacoes-estoque';
  private readonly pecasSubject = new BehaviorSubject<Peca[]>(this.carregarPecas());
  private readonly movimentacoesSubject = new BehaviorSubject<MovimentacaoEstoque[]>(
    this.carregarMovimentacoes(),
  );

  listar(): Observable<Peca[]> {
    return this.pecasSubject.asObservable();
  }

  listarAtual(): Peca[] {
    return this.pecasSubject.value;
  }

  listarMovimentacoes(): Observable<MovimentacaoEstoque[]> {
    return this.movimentacoesSubject.asObservable();
  }

  buscarPorId(id: string): Peca | undefined {
    return this.pecasSubject.value.find((peca) => peca.id === id);
  }

  listarAbaixoDoMinimo(): Peca[] {
    return this.pecasSubject.value.filter(
      (peca) => peca.ativo && peca.quantidadeAtual <= peca.quantidadeMinima,
    );
  }

  criar(peca: NovaPeca): Peca {
    const agora = new Date().toISOString();
    const novaPeca: Peca = {
      ...peca,
      id: this.gerarId(),
      dataCadastro: agora,
      dataAtualizacao: agora,
    };

    this.atualizarPecas([...this.pecasSubject.value, novaPeca]);
    return novaPeca;
  }

  atualizar(id: string, alteracoes: AtualizacaoPeca): Peca | undefined {
    const pecaAtual = this.buscarPorId(id);

    if (!pecaAtual) {
      return undefined;
    }

    const pecaAtualizada: Peca = {
      ...pecaAtual,
      ...alteracoes,
      dataAtualizacao: new Date().toISOString(),
    };

    this.atualizarPecas(
      this.pecasSubject.value.map((peca) => (peca.id === id ? pecaAtualizada : peca)),
    );

    return pecaAtualizada;
  }

  remover(id: string): void {
    this.atualizarPecas(this.pecasSubject.value.filter((peca) => peca.id !== id));
  }

  registrarMovimentacao(
    pecaId: string,
    tipo: TipoMovimentacaoEstoque,
    quantidade: number,
    motivo: string,
    servicoId?: string,
  ): MovimentacaoEstoque | undefined {
    const peca = this.buscarPorId(pecaId);

    if (!peca || quantidade < 0) {
      return undefined;
    }

    const quantidadeFinal = this.calcularQuantidadeFinal(peca.quantidadeAtual, tipo, quantidade);

    const movimentacao: MovimentacaoEstoque = {
      id: this.gerarId(),
      pecaId,
      tipo,
      quantidade,
      quantidadeAnterior: peca.quantidadeAtual,
      quantidadeFinal,
      motivo,
      servicoId,
      dataMovimentacao: new Date().toISOString(),
    };

    this.atualizar(pecaId, { quantidadeAtual: quantidadeFinal });
    this.atualizarMovimentacoes([...this.movimentacoesSubject.value, movimentacao]);
    return movimentacao;
  }

  private calcularQuantidadeFinal(
    quantidadeAtual: number,
    tipo: TipoMovimentacaoEstoque,
    quantidade: number,
  ): number {
    if (tipo === 'entrada') {
      return quantidadeAtual + quantidade;
    }

    if (tipo === 'saida') {
      return Math.max(quantidadeAtual - quantidade, 0);
    }

    return quantidade;
  }

  private atualizarPecas(pecas: Peca[]): void {
    this.pecasSubject.next(pecas);
    this.salvar(this.pecasStorageKey, pecas);
  }

  private atualizarMovimentacoes(movimentacoes: MovimentacaoEstoque[]): void {
    this.movimentacoesSubject.next(movimentacoes);
    this.salvar(this.movimentacoesStorageKey, movimentacoes);
  }

  private carregarPecas(): Peca[] {
    return this.carregar<Peca>(this.pecasStorageKey);
  }

  private carregarMovimentacoes(): MovimentacaoEstoque[] {
    return this.carregar<MovimentacaoEstoque>(this.movimentacoesStorageKey);
  }

  private carregar<T>(storageKey: string): T[] {
    if (!this.temLocalStorage()) {
      return [];
    }

    const dados = localStorage.getItem(storageKey);

    if (!dados) {
      return [];
    }

    try {
      return JSON.parse(dados) as T[];
    } catch {
      return [];
    }
  }

  private salvar<T>(storageKey: string, dados: T[]): void {
    if (this.temLocalStorage()) {
      localStorage.setItem(storageKey, JSON.stringify(dados));
    }
  }

  private temLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private gerarId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  }
}
