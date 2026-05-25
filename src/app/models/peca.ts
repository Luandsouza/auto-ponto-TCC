export type TipoMovimentacaoEstoque = 'entrada' | 'saida' | 'ajuste';

export interface Peca {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  fabricante?: string;
  fornecedor?: string;
  localizacao?: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  valorCusto: number;
  valorVenda: number;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface MovimentacaoEstoque {
  id: string;
  pecaId: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadeFinal: number;
  motivo: string;
  servicoId?: string;
  dataMovimentacao: string;
}

export type NovaPeca = Omit<Peca, 'id' | 'dataCadastro' | 'dataAtualizacao'>;
export type AtualizacaoPeca = Partial<NovaPeca>;
