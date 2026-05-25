export type ServicoStatus =
  | 'orcamento'
  | 'aprovado'
  | 'em_andamento'
  | 'aguardando_peca'
  | 'concluido'
  | 'cancelado';

export type ServicoCategoria =
  | 'revisao'
  | 'manutencao'
  | 'funilaria'
  | 'eletrica'
  | 'diagnostico'
  | 'outros';

export interface ItemServico {
  pecaId: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Servico {
  id: string;
  clienteId?: string;
  veiculoId?: string;
  mecanicoId?: string;
  titulo: string;
  descricao: string;
  categoria: ServicoCategoria;
  status: ServicoStatus;
  valorMaoObra: number;
  valorPecas: number;
  desconto: number;
  total: number;
  pecas: ItemServico[];
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  observacoes?: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export type NovoServico = Omit<Servico, 'id' | 'total' | 'dataCadastro' | 'dataAtualizacao'>;
export type AtualizacaoServico = Partial<NovoServico>;
