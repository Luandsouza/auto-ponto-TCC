export type StatusAtendimento =
  | 'Solicitado'
  | 'Aguardando Orçamento'
  | 'Aguardando Aprovação'
  | 'Reprovado'
  | 'Aprovado'
  | 'Em Execução'
  | 'Finalizado'
  | 'Cancelado';

export type StatusOrcamentoCliente = 'pendente' | 'aprovado' | 'reprovado';

export interface OrcamentoCliente {
  descricao: string;
  valor: number;
  observacao?: string;
  status: StatusOrcamentoCliente;
  enviadoEm: string;
  respondidoEm?: string;
}

export interface AgendamentoCliente {
  id: number;
  cliente: string;
  automovel: string;
  placa: string;
  servico: string;
  data: string;
  hora: string;
  observacao: string;
  status: StatusAtendimento;
  ordemServicoNumero?: string;
  ordemServicoId?: number;
  orcamento?: OrcamentoCliente;
  atualizadoEm: string;
}

export const AGENDAMENTOS_STORAGE_KEY = 'agendamentos_cliente';
