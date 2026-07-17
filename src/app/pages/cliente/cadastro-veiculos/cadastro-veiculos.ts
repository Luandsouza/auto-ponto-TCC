import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AutoChart, AutoChartDatum } from '../../../components/auto-chart/auto-chart';

export interface Veiculo {
  id: number;
  placa: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  combustivel: 'Gasolina' | 'Etanol' | 'Flex' | 'Diesel' | 'Elétrico';
  status: 'Disponível' | 'Vendido' | 'Manutenção';
  preco: number;
  quilometragem: number;
  observacoes?: string;
}

@Component({
  selector: 'app-cadastro-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
    AutoChart,
  ],
  templateUrl: './cadastro-veiculos.component.html',
  styleUrls: ['./cadastro-veiculos.component.css']
})
export class CadastroVeiculosComponent implements OnInit {
  private readonly storageKey = 'veiculos';
  veiculoForm!: FormGroup;
  veiculos: Veiculo[] = [];
  editando = false;
  veiculoEditandoId: number | null = null;
  mensagemSucesso = '';
  mensagemErro = '';
  currentYear = new Date().getFullYear();

  marcas = ['Toyota', 'Honda', 'Volkswagen', 'Chevrolet', 'Fiat', 'Hyundai', 'Nissan', 'Ford', 'Renault', 'BMW', 'Mercedes-Benz'];
  combustiveis = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Elétrico'] as const;
  statusVeiculo = ['Disponível', 'Vendido', 'Manutenção'] as const;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.carregarVeiculos();
  }

  initForm(): void {
    this.veiculoForm = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/)]],
      // renavam: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      modelo: ['', Validators.required],
      marca: ['', Validators.required],
      ano: ['', [Validators.required, Validators.min(1886), Validators.max(this.currentYear + 1)]],
      cor: ['', Validators.required],
      combustivel: ['Flex', Validators.required],
      quilometragem: ['', [Validators.required, Validators.min(0)]],
      observacoes: ['']
    });

    this.veiculoForm.get('placa')?.valueChanges.subscribe(valor => {
      const placa = String(valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
      if (valor !== placa) {
        this.veiculoForm.get('placa')?.setValue(placa, { emitEvent: false });
      }
    });

    this.veiculoForm.get('renavam')?.valueChanges.subscribe(valor => {
      const renavam = String(valor || '').replace(/\D/g, '').slice(0, 11);
      if (valor !== renavam) {
        this.veiculoForm.get('renavam')?.setValue(renavam, { emitEvent: false });
      }
    });
  }

  carregarVeiculos(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      this.veiculos = saved
        ? (JSON.parse(saved) as Partial<Veiculo>[]).map((veiculo, index) => ({
            id: veiculo.id ?? Date.now() + index,
            placa: veiculo.placa || '',
            renavam: veiculo.renavam || '',
            modelo: veiculo.modelo || '',
            marca: veiculo.marca || '',
            ano: Number(veiculo.ano) || 0,
            cor: veiculo.cor || '',
            combustivel: veiculo.combustivel || 'Flex',
            status: veiculo.status || 'Disponível',
            preco: Number(veiculo.preco) || 0,
            quilometragem: Number(veiculo.quilometragem) || 0,
            observacoes: veiculo.observacoes || '',
          }))
        : [];
    } catch {
      this.veiculos = [];
    }
  }

  salvarVeiculo(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.veiculoForm.invalid) {
      this.veiculoForm.markAllAsTouched();
      this.mensagemErro = 'Revise os campos obrigatórios antes de salvar.';
      return;
    }

    const placa = String(this.veiculoForm.value.placa).toUpperCase();
    const placaDuplicada = this.veiculos.some(
      veiculo => veiculo.placa === placa && veiculo.id !== this.veiculoEditandoId,
    );

    if (placaDuplicada) {
      this.mensagemErro = 'Já existe um veículo cadastrado com esta placa.';
      this.veiculoForm.get('placa')?.setErrors({ duplicada: true });
      return;
    }

    const novoVeiculo: Veiculo = {
      ...this.veiculoForm.getRawValue(),
      id: this.veiculoEditandoId ?? Date.now(),
      placa,
      ano: Number(this.veiculoForm.value.ano),
      quilometragem: Number(this.veiculoForm.value.quilometragem),
      status: 'Disponível',
      preco: 0,
    };

    if (this.editando && this.veiculoEditandoId !== null) {
      const index = this.veiculos.findIndex(v => v.id === this.veiculoEditandoId);
      if (index !== -1) {
        this.veiculos = this.veiculos.map(veiculo =>
          veiculo.id === this.veiculoEditandoId ? novoVeiculo : veiculo,
        );
      }
      this.mensagemSucesso = 'Veículo atualizado com sucesso.';
    } else {
      this.veiculos = [novoVeiculo, ...this.veiculos];
      this.mensagemSucesso = 'Veículo salvo. O formulário já está pronto para outro cadastro.';
    }

    this.salvarLocalStorage();
    this.resetarForm(false);
  }

  editarVeiculo(veiculo: Veiculo): void {
    this.editando = true;
    this.veiculoEditandoId = veiculo.id;
    this.veiculoForm.patchValue(veiculo);
    this.mensagemSucesso = '';
    this.mensagemErro = '';
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  excluirVeiculo(id: number): void {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      this.veiculos = this.veiculos.filter(v => v.id !== id);
      this.salvarLocalStorage();
      if (this.veiculoEditandoId === id) {
        this.resetarForm();
      }
    }
  }

  resetarForm(limparMensagens = true): void {
    this.veiculoForm.reset({
      combustivel: 'Flex'
    });
    this.editando = false;
    this.veiculoEditandoId = null;
    if (limparMensagens) {
      this.mensagemSucesso = '';
      this.mensagemErro = '';
    }
  }

  prepararNovoCadastro(): void {
    this.resetarForm();
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  salvarLocalStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.veiculos));
  }

  getTotalVeiculos(): number {
    return this.veiculos.length;
  }

  getVeiculosDisponiveis(): number {
    return this.veiculos.filter(v => v.status === 'Disponível').length;
  }

  get veiculosChartData(): AutoChartDatum[] {
    const disponiveis = this.veiculos.filter(veiculo => veiculo.status === 'Disponível').length;
    const manutencao = this.veiculos.filter(veiculo => veiculo.status === 'Manutenção').length;
    const vendidos = this.veiculos.filter(veiculo => veiculo.status === 'Vendido').length;

    return [
      { label: 'Disponíveis', value: disponiveis, color: '#1aa7f2' },
      { label: 'Em manutenção', value: manutencao, color: '#ff7418' },
      { label: 'Vendidos', value: vendidos, color: '#64748b' },
    ];
  }

  iniciaisVeiculo(veiculo: Veiculo): string {
    return `${veiculo.marca.charAt(0)}${veiculo.modelo.charAt(0)}`.toUpperCase();
  }

  classeStatus(status: Veiculo['status']): string {
    return {
      Disponível: 'status-disponivel',
      Manutenção: 'status-manutencao',
      Vendido: 'status-vendido',
    }[status];
  }

  get f() {
    return this.veiculoForm.controls;
  }
}
