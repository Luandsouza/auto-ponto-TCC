import { TestBed } from '@angular/core/testing';

import { OrdemServico } from '../models/ordem-servico';
import { FinanceiroService } from './financeiro.service';

describe('FinanceiroService', () => {
  let service: FinanceiroService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceiroService);
  });

  it('calcula receitas, despesas, pendências e saldo sem considerar cancelados', () => {
    service.criar({
      tipo: 'receita',
      categoria: 'servico',
      descricao: 'Receita paga',
      valor: 1000,
      status: 'pago',
      dataVencimento: '2026-06-21',
      dataPagamento: '2026-06-21',
    });
    service.criar({
      tipo: 'receita',
      categoria: 'servico',
      descricao: 'Receita pendente',
      valor: 500,
      status: 'pendente',
      dataVencimento: '2026-06-21',
    });
    service.criar({
      tipo: 'despesa',
      categoria: 'fornecedor',
      descricao: 'Despesa paga',
      valor: 300,
      status: 'pago',
      dataVencimento: '2026-06-21',
      dataPagamento: '2026-06-21',
    });
    service.criar({
      tipo: 'despesa',
      categoria: 'outros',
      descricao: 'Cancelado',
      valor: 9999,
      status: 'cancelado',
      dataVencimento: '2026-06-21',
    });

    expect(service.gerarResumo()).toEqual({
      totalReceitas: 1500,
      totalDespesas: 300,
      saldo: 1200,
      totalReceitasPagas: 1000,
      totalDespesasPagas: 300,
      saldoRealizado: 700,
      pendenteReceber: 500,
      pendentePagar: 0,
    });
  });

  it('inclui todo o dia final no filtro de período', () => {
    service.criar({
      tipo: 'receita',
      categoria: 'servico',
      descricao: 'Fim do dia',
      valor: 250,
      status: 'pendente',
      dataVencimento: '2026-06-21T22:30:00.000Z',
    });

    expect(
      service.filtrarPorPeriodo({
        dataInicial: '2026-06-21',
        dataFinal: '2026-06-21',
      }),
    ).toHaveLength(1);
  });

  it('mantém apenas um lançamento por OS e atualiza valor e status', () => {
    const ordem: OrdemServico = {
      id: 10,
      numero: 'OS-010',
      cliente: 'Cliente',
      veiculo: 'Veículo',
      placa: 'ABC1D23',
      dataAbertura: '2026-06-21T12:00:00.000Z',
      dataPrevisao: '2026-06-25T12:00:00.000Z',
      status: 'Aguardando Execução',
      prioridade: 'Média',
      servicos: ['Revisão'],
      valorTotal: 700,
      observacoes: '',
      atualizadoEm: '2026-06-21T12:00:00.000Z',
    };

    service.sincronizarOrdemServico(ordem);
    service.sincronizarOrdemServico({
      ...ordem,
      status: 'Em Execução',
      valorTotal: 850,
    });

    expect(service.listarAtual()).toHaveLength(1);
    expect(service.listarAtual()[0]).toMatchObject({
      ordemServicoId: 10,
      valor: 850,
      status: 'pendente',
    });

    service.sincronizarOrdemServico({ ...ordem, status: 'Cancelado' });
    expect(service.listarAtual()[0].status).toBe('cancelado');
    expect(service.gerarResumo().totalReceitas).toBe(0);
  });
});
