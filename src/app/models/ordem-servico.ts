import { AgendamentoCliente, StatusAtendimento } from './agendamento-cliente';

export type StatusEmpresa =
  | 'Aguardando Orçamento'
  | 'Orçamento em Execução'
  | 'Aguardando Aprovação'
  | 'Aguardando Execução'
  | 'Em Execução'
  | 'Finalizado'
  | 'Cancelado';

export type PrioridadeOrdem = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export interface OrdemServico {
  id: number;
  numero: string;
  cliente: string;
  veiculo: string;
  placa: string;
  dataAbertura: string;
  dataPrevisao: string;
  status: StatusEmpresa;
  prioridade: PrioridadeOrdem;
  servicos: string[];
  valorTotal: number;
  observacoes: string;
  agendamentoId?: number;
  atualizadoEm: string;
}

export const STATUS_EMPRESA: StatusEmpresa[] = [
  'Aguardando Orçamento',
  'Orçamento em Execução',
  'Aguardando Aprovação',
  'Aguardando Execução',
  'Em Execução',
  'Finalizado',
  'Cancelado',
];

export function statusVisivelAoCliente(
  ordem: Pick<OrdemServico, 'status'>,
  agendamento?: Pick<AgendamentoCliente, 'orcamento'>,
): StatusAtendimento {
  if (ordem.status === 'Cancelado') {
    return 'Cancelado';
  }

  if (
    ordem.status === 'Aguardando Orçamento' &&
    agendamento?.orcamento?.status === 'reprovado'
  ) {
    return 'Reprovado';
  }

  const status: Record<Exclude<StatusEmpresa, 'Cancelado'>, StatusAtendimento> = {
    'Aguardando Orçamento': 'Aguardando Orçamento',
    'Orçamento em Execução': 'Aguardando Orçamento',
    'Aguardando Aprovação': 'Aguardando Aprovação',
    'Aguardando Execução': 'Aprovado',
    'Em Execução': 'Em Execução',
    Finalizado: 'Finalizado',
  };

  return status[ordem.status];
}

export function clientePodeCancelar(status: StatusEmpresa): boolean {
  return !['Em Execução', 'Finalizado', 'Cancelado'].includes(status);
}
