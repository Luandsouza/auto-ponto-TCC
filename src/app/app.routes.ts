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
      path: "cadastro-veiculos",
      loadComponent: () => import(`./pages/mecanico/cadastro-veiculos/cadastro-veiculos`).then(x => x.CadastroVeiculosComponent)
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
      path: "kanban-servicos",
      loadComponent: () => import(`./pages/mecanico/kanban-servicos/kanban-servicos.component`).then(x => x.KanbanServicosComponent)
   },
   {
      path: "**",
      redirectTo: ""
   },
];
