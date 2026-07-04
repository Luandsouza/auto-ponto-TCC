import { Routes } from '@angular/router';

export const routes: Routes = [
   {
      path: "",
      redirectTo: "home",
      pathMatch: "full"
   },
   {
      path: "home",
      loadComponent: () => import(`./auth/login/login`).then(x => x.Login)
   },
   {
      path: "cliente",
      loadComponent: () => import(`./pages/cliente/home-cliente/home-cliente`).then(x => x.HomeCliente)
   },
   {
      path: "agenda",
      loadComponent: () => import(`./pages/cliente/agenda-cliente/lista-agenda-cliente/lista-agenda-cliente`).then(x => x.ListaAgendaCliente)
   },
   {
      path: "cliente/agendar",
      redirectTo: "agenda",
      pathMatch: "full"
   },
   {
      path: "login",
      redirectTo: "home",
      pathMatch: "full"
   },

   {
      path: "mecanica",
      loadComponent: () => import(`./pages/mecanico/home-mecanico/home-mecanico`).then(x => x.HomeMecanico)
   },
   {
      path: "mecanico",
      redirectTo: "mecanica",
      pathMatch: "full"
   },
   {
      path: "servicos",
      loadComponent: () => import(`./pages/mecanico/servicos/servicos`).then(x => x.Servicos)
   },
   {
      path: "estoque",
      loadComponent: () => import(`./pages/mecanico/estoque/estoque`).then(x => x.Estoque)
   },
   {
      path: "financeiro",
      loadComponent: () => import(`./pages/mecanico/financeiro/financeiro`).then(x => x.Financeiro)
   },
   {
      path: "relatorios",
      loadComponent: () => import(`./pages/mecanico/relatorios/relatorios`).then(x => x.Relatorios)
   },
   {
      path: "equipes-mecanico",
      loadComponent: () => import(`./pages/mecanico/equipes-mecanico/equipes-mecanico`).then(x => x.EquipesMecanico)
   },
   {
      path: "calendario",
      loadComponent: () => import(`./pages/mecanico/calendario/calendario.component`).then(x => x.CalendarioComponent)
   },
   {
      path: "cliente/veiculos",
      loadComponent: () => import(`./pages/cliente/cadastro-veiculos/cadastro-veiculos`).then(x => x.CadastroVeiculosComponent)
   },
   {
      path: "status",
      loadComponent: () => import(`./pages/cliente/status-servicos/status-servicos`).then(x => x.StatusServicos)
   },
   {
      path: "ordens-servico",
      loadComponent: () => import(`./pages/mecanico/ordens-servico/ordens-servico.component`).then(x => x.OrdensServicoComponent)
   },
   {
      path: "checklist-os",
      loadComponent: () => import(`./pages/mecanico/checklist-os/checklist-os.component`).then(x => x.ChecklistOsComponent)
   },
   {
      path: "**",
      redirectTo: ""
   },
];
