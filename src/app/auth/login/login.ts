import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type TipoLogin = 'cliente' | 'mecanico';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  clienteImagem = 'assets/images/cliente-oficina-realista.jpg';
  oficinaImagem = 'assets/images/oficina-mecanica-completa-realista.jpg';
  tipoLogin: TipoLogin | null = null;
  email = '';
  senha = '';
  mostrarSenha = false;
  loginEnviado = false;

  constructor(private readonly router: Router) {}

  abrirModal(tipo: TipoLogin): void {
    this.tipoLogin = tipo;
    this.email = '';
    this.senha = '';
    this.mostrarSenha = false;
    this.loginEnviado = false;
  }

  fecharModal(): void {
    this.tipoLogin = null;
  }

  entrar(formularioValido: boolean | null): void {
    this.loginEnviado = true;

    if (!formularioValido || !this.tipoLogin) {
      return;
    }

    void this.router.navigate([this.tipoLogin === 'cliente' ? '/cliente' : '/mecanica']);
  }
}
