export type StatusAtendimento =
  | 'Solicitado'
  | 'Aberta'
  | 'Em Andamento'
  | 'Aguardando Peças'
  | 'Concluída'
  | 'Cancelada';

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
  atualizadoEm: string;
}

export const AGENDAMENTOS_STORAGE_KEY = 'agendamentos_cliente';
