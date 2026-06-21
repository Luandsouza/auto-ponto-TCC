export type TipoLancamentoFinanceiro = 'receita' | 'despesa';
export type StatusLancamentoFinanceiro = 'pendente' | 'pago' | 'cancelado';
export type OrigemLancamentoFinanceiro = 'manual' | 'servico' | 'ordem_servico';

export type CategoriaFinanceira =
  | 'servico'
  | 'peca'
  | 'salario'
  | 'fornecedor'
  | 'imposto'
  | 'aluguel'
  | 'outros';

export interface LancamentoFinanceiro {
  id: string;
  tipo: TipoLancamentoFinanceiro;
  categoria: CategoriaFinanceira;
  descricao: string;
  valor: number;
  status: StatusLancamentoFinanceiro;
  dataVencimento: string;
  dataPagamento?: string;
  servicoId?: string;
  ordemServicoId?: number;
  pecaId?: string;
  origem?: OrigemLancamentoFinanceiro;
  observacoes?: string;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  totalReceitasPagas: number;
  totalDespesasPagas: number;
  saldoRealizado: number;
  pendenteReceber: number;
  pendentePagar: number;
}

export type NovoLancamentoFinanceiro = Omit<
  LancamentoFinanceiro,
  'id' | 'dataCadastro' | 'dataAtualizacao'
>;
export type AtualizacaoLancamentoFinanceiro = Partial<NovoLancamentoFinanceiro>;
