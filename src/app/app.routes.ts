import { Routes } from '@angular/router';


export const routes: Routes = [

   
   {
      path: "home",
      loadComponent: ()=> import(`./pages/cliente/home-cliente/home-cliente`).then(x => x.HomeCliente)
   },
   {
      path: "agenda",
      loadComponent: ()=> import(`./pages/cliente/agenda-cliente/lista-agenda-cliente/lista-agenda-cliente`).then(x => x.ListaAgendaCliente)
   },
   {
      path:"cliente/agendar",
      loadComponent: ()=> import(`./pages/cliente/agenda-cliente/cadastro-agenda-cliente/cadastro-agenda-cliente`).then(x => x.CadastroAgendaCliente)
   },
   {
      path:"login",
      loadComponent: () => import(`./auth/login/login`).then(x => x.Login)
   }

  
];






