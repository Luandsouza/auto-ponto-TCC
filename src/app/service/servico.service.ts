import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AtualizacaoServico, NovoServico, Servico, ServicoStatus } from '../models/servico';

@Injectable({
  providedIn: 'root',
})
export class ServicoService {
  private readonly storageKey = 'auto-ponto-servicos';
  private readonly servicosSubject = new BehaviorSubject<Servico[]>(this.carregar());

  listar(): Observable<Servico[]> {
    return this.servicosSubject.asObservable();
  }

  listarAtual(): Servico[] {
    return this.servicosSubject.value;
  }

  buscarPorId(id: string): Servico | undefined {
    return this.servicosSubject.value.find((servico) => servico.id === id);
  }

  filtrarPorStatus(status: ServicoStatus): Servico[] {
    return this.servicosSubject.value.filter((servico) => servico.status === status);
  }

  criar(servico: NovoServico): Servico {
    const agora = new Date().toISOString();
    const novoServico: Servico = {
      ...servico,
      id: this.gerarId(),
      total: this.calcularTotal(servico.valorMaoObra, servico.valorPecas, servico.desconto),
      dataCadastro: agora,
      dataAtualizacao: agora,
    };

    this.atualizarLista([...this.servicosSubject.value, novoServico]);
    return novoServico;
  }

  atualizar(id: string, alteracoes: AtualizacaoServico): Servico | undefined {
    const servicoAtual = this.buscarPorId(id);

    if (!servicoAtual) {
      return undefined;
    }

    const servicoAtualizado: Servico = {
      ...servicoAtual,
      ...alteracoes,
      total: this.calcularTotal(
        alteracoes.valorMaoObra ?? servicoAtual.valorMaoObra,
        alteracoes.valorPecas ?? servicoAtual.valorPecas,
        alteracoes.desconto ?? servicoAtual.desconto,
      ),
      dataAtualizacao: new Date().toISOString(),
    };

    this.atualizarLista(
      this.servicosSubject.value.map((servico) =>
        servico.id === id ? servicoAtualizado : servico,
      ),
    );

    return servicoAtualizado;
  }

  remover(id: string): void {
    this.atualizarLista(this.servicosSubject.value.filter((servico) => servico.id !== id));
  }

  concluir(id: string): Servico | undefined {
    return this.atualizar(id, {
      status: 'concluido',
      dataConclusao: new Date().toISOString(),
    });
  }

  private calcularTotal(valorMaoObra: number, valorPecas: number, desconto: number): number {
    return Math.max(valorMaoObra + valorPecas - desconto, 0);
  }

  private atualizarLista(servicos: Servico[]): void {
    this.servicosSubject.next(servicos);
    this.salvar(servicos);
  }

  private carregar(): Servico[] {
    if (!this.temLocalStorage()) {
      return [];
    }

    const dados = localStorage.getItem(this.storageKey);

    if (!dados) {
      return [];
    }

    try {
      return JSON.parse(dados) as Servico[];
    } catch {
      return [];
    }
  }

  private salvar(servicos: Servico[]): void {
    if (this.temLocalStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(servicos));
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
