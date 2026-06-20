import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

export interface Veiculo {
  id?: number;
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
    CurrencyPipe,
    DecimalPipe
  ],
  templateUrl: './cadastro-veiculos.component.html',
  styleUrls: ['./cadastro-veiculos.component.css']
})
export class CadastroVeiculosComponent implements OnInit {
  veiculoForm!: FormGroup;
  veiculos: Veiculo[] = [];
  editando = false;
  veiculoEditandoId: number | null = null;
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
      renavam: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      modelo: ['', Validators.required],
      marca: ['', Validators.required],
      ano: ['', [Validators.required, Validators.min(1886), Validators.max(this.currentYear + 1)]],
      cor: ['', Validators.required],
      combustivel: ['Flex', Validators.required],
      status: ['Disponível', Validators.required],
      preco: ['', [Validators.required, Validators.min(0)]],
      quilometragem: ['', [Validators.required, Validators.min(0)]],
      observacoes: ['']
    });
  }

  carregarVeiculos(): void {
    const saved = localStorage.getItem('veiculos');
    if (saved) {
      this.veiculos = JSON.parse(saved);
    } else {
      this.veiculos = [
        {
          id: 1,
          placa: 'ABC1D23',
          renavam: '12345678901',
          modelo: 'Civic',
          marca: 'Honda',
          ano: 2022,
          cor: 'Prata',
          combustivel: 'Flex',
          status: 'Disponível',
          preco: 125000,
          quilometragem: 15000
        }
      ];
    }
  }

  salvarVeiculo(): void {
    if (this.veiculoForm.invalid) {
      Object.keys(this.veiculoForm.controls).forEach(key => {
        this.veiculoForm.get(key)?.markAsTouched();
      });
      return;
    }

    const novoVeiculo: Veiculo = this.veiculoForm.value;

    if (this.editando && this.veiculoEditandoId !== null) {
      const index = this.veiculos.findIndex(v => v.id === this.veiculoEditandoId);
      if (index !== -1) {
        novoVeiculo.id = this.veiculoEditandoId;
        this.veiculos[index] = novoVeiculo;
      }
      this.editando = false;
      this.veiculoEditandoId = null;
    } else {
      novoVeiculo.id = Date.now();
      this.veiculos.push(novoVeiculo);
    }

    this.salvarLocalStorage();
    this.resetarForm();
    this.carregarVeiculos();
  }

  editarVeiculo(veiculo: Veiculo): void {
    this.editando = true;
    this.veiculoEditandoId = veiculo.id || null;
    this.veiculoForm.patchValue(veiculo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluirVeiculo(id: number): void {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
      this.veiculos = this.veiculos.filter(v => v.id !== id);
      this.salvarLocalStorage();
      this.carregarVeiculos();
    }
  }

  resetarForm(): void {
    this.veiculoForm.reset({
      combustivel: 'Flex',
      status: 'Disponível'
    });
    this.editando = false;
    this.veiculoEditandoId = null;
  }

  salvarLocalStorage(): void {
    localStorage.setItem('veiculos', JSON.stringify(this.veiculos));
  }

  getTotalVeiculos(): number {
    return this.veiculos.length;
  }

  getVeiculosDisponiveis(): number {
    return this.veiculos.filter(v => v.status === 'Disponível').length;
  }

  get f() {
    return this.veiculoForm.controls;
  }
}
