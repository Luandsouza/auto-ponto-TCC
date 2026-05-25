export interface Mecanico {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  especialidade?: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}
