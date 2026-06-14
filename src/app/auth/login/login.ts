import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  clienteImagem = 'assets/images/cliente-oficina-realista.jpg';
  oficinaImagem = 'assets/images/oficina-mecanica-completa-realista.jpg';
}
