import { Routes } from '@angular/router';

export const routes: Routes = [
   {
      path: "",
      loadComponent: () => import(`./auth/login/login`).then(x => x.Login)
   },
   {
      path: "home",
      loadComponent: () => import(`./pages/cliente/home-cliente/home-cliente`).then(x => x.HomeCliente)
   },
   {
      path: "agenda",
      loadComponent: () => import(`./pages/cliente/agenda-cliente/lista-agenda-cliente/lista-agenda-cliente`).then(x => x.ListaAgendaCliente)
   },
   {
      path: "cliente/agendar",
      loadComponent: () => import(`./pages/cliente/agenda-cliente/cadastro-agenda-cliente/cadastro-agenda-cliente`).then(x => x.CadastroAgendaCliente)
   },
   {
      path: "login",
      loadComponent: () => import(`./auth/login/login`).then(x => x.Login)
   },

  {
      path: "mecanica",
      loadComponent: () => import(`./pages/mecanico/home-mecanico/home-mecanico`).then(x => x.HomeMecanico)
   },
   {
      path: "servicos",
      loadComponent: () => import(`./pages/mecanico/servicos/servicos`).then(x => x.Servicos)
   },
   {
      path: "estoque",
      loadComponent: () => import(`./pages/mecanico/estoque/estoque`).then(x => x.Estoque)
   },
   // {
   //    path: "financeiro",
   //    loadComponent: () => import(`./pages/mecanico/financeiro/financeiro`).then(x => x.Financeiro)
   // },
   // {
   //    path: "relatorios",
   //    loadComponent: () => import(`./pages/mecanico/relatorios/relatorios`).then(x => x.Relatorios)
   // },
   {
      path: "**",
      redirectTo: ""
   },
];
