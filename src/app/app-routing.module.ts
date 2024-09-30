import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { adminGuard } from "./guards/admin.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: 'home',
    loadChildren: () =>
      import("./pages/usuario/home/home.module").then((m) => m.HomePageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import("./pages/auth/login/login.module").then((m) => m.LoginPageModule),
    canActivate: [AuthGuard], //* Protegido por AuthGuard en caso de que el usuario este logeado.
  },
  {
    path: 'historial-viajes',
    loadChildren: () => import('./pages/viaje/historial-viajes/historial-viajes.module').then( m => m.HistorialViajesPageModule)
  },
  { //* Se le da el parametro de nombre
    path: 'detalle-viajes/:id',
    loadChildren: () => import('./pages/viaje/detalle-viajes/detalle-viajes.module').then( m => m.DetalleViajesPageModule)
  },
  { //* Se le da el parametro de nombre
    path: 'detalle-choferes/:nombre',
    loadChildren: () => import('./pages/viaje/detalle-choferes/detalle-choferes.module').then( m => m.DetalleChoferesPageModule)
  },  {
    path: 'recuperar-contrasena',
    loadChildren: () => import('./pages/auth/recuperar-contrasena/recuperar-contrasena.module').then( m => m.RecuperarContrasenaPageModule),
    canActivate: [AuthGuard], //* Protegido por AuthGuard en caso de que el usuario este logeado.
  },
  {
    path: 'mapa',
    loadChildren: () => import('./pages/viaje/mapa/mapa.module').then( m => m.MapaPageModule)
  },
  {
    path: 'adminDashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [adminGuard]  //* Protegido por el adminGuard en caso de que el usuario no sea administrador
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/usuario/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule),
    canActivate: [AuthGuard], //* Protegido por AuthGuard en caso de que el usuario este logeado.
  },
  {
    path: 'administracion-usuarios',
    loadChildren: () => import('./pages/admin/administracion-usuarios/administracion-usuarios.module').then( m => m.AdministracionUsuariosPageModule),
    canActivate: [adminGuard]  //* Protegido por el adminGuard en caso de que el usuario no sea administrador
  },
  {
    path: 'administracion-viajes',
    loadChildren: () => import('./pages/admin/administracion-viajes/administracion-viajes.module').then( m => m.AdministracionViajesPageModule),
    canActivate: [adminGuard]  //* Protegido por el adminGuard en caso de que el usuario no sea administrador
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
