import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { AutoChart, AutoChartDatum } from '../../../components/auto-chart/auto-chart';

type ServicoTime = {
  nome: string;
  quantidade: number;
  horas: number;
  faturamento: number;
};

type MembroTime = {
  nome: string;
  funcao: string;
  especialidade: string;
  turno: string;
  produtividade: number;
};

type TimeMecanico = {
  nome: string;
  foco: string;
  lider: string;
  cor: string;
  membros: MembroTime[];
  servicos: ServicoTime[];
};

@Component({
  selector: 'app-equipes-mecanico',
  imports: [CommonModule, AutoChart],
  templateUrl: './equipes-mecanico.html',
  styleUrl: './equipes-mecanico.css',
})
export class EquipesMecanico {
  readonly equipes: TimeMecanico[] = [
    {
      nome: 'Time Diagnóstico',
      foco: 'Triagem, scanner, elétrica e análise de falhas',
      lider: 'Rafael Mendes',
      cor: '#1E3A8A',
      membros: [
        { nome: 'Rafael Mendes', funcao: 'Líder técnico', especialidade: 'Diagnóstico eletrônico', turno: 'Manhã', produtividade: 94 },
        { nome: 'Camila Rocha', funcao: 'Mecânica eletricista', especialidade: 'Injeção e sensores', turno: 'Manhã', produtividade: 89 },
        { nome: 'João Batista', funcao: 'Auxiliar técnico', especialidade: 'Checklist e testes', turno: 'Tarde', produtividade: 83 },
      ],
      servicos: [
        { nome: 'Scanner', quantidade: 36, horas: 54, faturamento: 7200 },
        { nome: 'Elétrica', quantidade: 22, horas: 61, faturamento: 9840 },
        { nome: 'Checklist', quantidade: 48, horas: 32, faturamento: 3840 },
      ],
    },
    {
      nome: 'Time Manutenção',
      foco: 'Revisões, motor, freios e suspensão',
      lider: 'Marcos Silva',
      cor: '#F59E0B',
      membros: [
        { nome: 'Marcos Silva', funcao: 'Coordenador de box', especialidade: 'Motor e câmbio', turno: 'Integral', produtividade: 91 },
        { nome: 'Bruna Almeida', funcao: 'Mecânica especialista', especialidade: 'Freios e suspensão', turno: 'Manhã', produtividade: 88 },
        { nome: 'Pedro Lima', funcao: 'Técnico de apoio', especialidade: 'Trocas rápidas', turno: 'Tarde', produtividade: 86 },
      ],
      servicos: [
        { nome: 'Revisões', quantidade: 44, horas: 96, faturamento: 22400 },
        { nome: 'Freios', quantidade: 31, horas: 58, faturamento: 13750 },
        { nome: 'Suspensão', quantidade: 18, horas: 49, faturamento: 12600 },
      ],
    },
    {
      nome: 'Time Acabamento',
      foco: 'Funilaria leve, estética, entrega e controle final',
      lider: 'Thiago Nunes',
      cor: '#0F766E',
      membros: [
        { nome: 'Thiago Nunes', funcao: 'Supervisor de qualidade', especialidade: 'Controle final', turno: 'Integral', produtividade: 93 },
        { nome: 'Larissa Costa', funcao: 'Técnica de acabamento', especialidade: 'Funilaria leve', turno: 'Manhã', produtividade: 85 },
        { nome: 'Diego Santos', funcao: 'Preparador de entrega', especialidade: 'Higienização e vistoria', turno: 'Tarde', produtividade: 90 },
      ],
      servicos: [
        { nome: 'Funilaria', quantidade: 16, horas: 72, faturamento: 16800 },
        { nome: 'Estética', quantidade: 28, horas: 42, faturamento: 8400 },
        { nome: 'Entrega', quantidade: 52, horas: 34, faturamento: 5200 },
      ],
    },
  ];

  get totalMecanicos(): number {
    return this.equipes.reduce((total, equipe) => total + equipe.membros.length, 0);
  }

  get totalServicos(): number {
    return this.equipes.reduce((total, equipe) => total + this.totalServicosEquipe(equipe), 0);
  }

  get totalHoras(): number {
    return this.equipes.reduce((total, equipe) => total + this.totalHorasEquipe(equipe), 0);
  }

  get faturamentoTotal(): number {
    return this.equipes.reduce((total, equipe) => total + this.faturamentoEquipe(equipe), 0);
  }

  get produtividadeMedia(): number {
    const membros = this.equipes.flatMap((equipe) => equipe.membros);
    const total = membros.reduce((soma, membro) => soma + membro.produtividade, 0);
    return Math.round(total / Math.max(membros.length, 1));
  }

  get servicosPorEquipeChart(): AutoChartDatum[] {
    return this.equipes.map((equipe) => ({
      label: equipe.nome.replace('Time ', ''),
      value: this.totalServicosEquipe(equipe),
      color: equipe.cor,
    }));
  }

  get faturamentoPorEquipeChart(): AutoChartDatum[] {
    return this.equipes.map((equipe) => ({
      label: equipe.nome.replace('Time ', ''),
      value: this.faturamentoEquipe(equipe),
      color: equipe.cor,
    }));
  }

  dadosServicosEquipe(equipe: TimeMecanico): AutoChartDatum[] {
    return equipe.servicos.map((servico, index) => ({
      label: servico.nome,
      value: servico.quantidade,
      color: index === 0 ? equipe.cor : ['#64748B', '#374151', '#B45309'][index - 1],
    }));
  }

  totalServicosEquipe(equipe: TimeMecanico): number {
    return equipe.servicos.reduce((total, servico) => total + servico.quantidade, 0);
  }

  totalHorasEquipe(equipe: TimeMecanico): number {
    return equipe.servicos.reduce((total, servico) => total + servico.horas, 0);
  }

  faturamentoEquipe(equipe: TimeMecanico): number {
    return equipe.servicos.reduce((total, servico) => total + servico.faturamento, 0);
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
}
