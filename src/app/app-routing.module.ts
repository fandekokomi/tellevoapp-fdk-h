import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { adminGuard } from "./guards/admin.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: "splashscreen",
    pathMatch: "full",
  },
  {
    path: 'home',
    loadChildren: () =>
      import("./pages/usuario/home/home.module").then((m) => m.HomePageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario no este logeado.
  },
  {
    path: 'login',
    loadChildren: () =>
      import("./pages/auth/login/login.module").then((m) => m.LoginPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },
  {
    path: 'recuperar-contrasena',
    loadChildren: () => import('./pages/auth/recuperar-contrasena/recuperar-contrasena.module').then( m => m.RecuperarContrasenaPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },
  {
    path: 'mapa',
    loadChildren: () => import('./pages/usuario/mapa/mapa.module').then( m => m.MapaPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario no este logeado.
  },
  {
    path: 'adminDashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then( m => m.DashboardPageModule),
    canActivate: [adminGuard]  //* Protegido por el adminGuard en caso de que el usuario no sea administrador
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/usuario/perfil/perfil.module').then( m => m.PerfilPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario no este logeado.
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/auth/register/register.module').then( m => m.RegisterPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
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
  {
    path: 'splashscreen',
    loadChildren: () => import('./pages/auth/splashscreen/splashscreen.module').then( m => m.SplashscreenPageModule)
  },
  { //* Se le da el parametro de nombre
    path: 'detalle-viajes/:uid',
    loadChildren: () => import('./pages/usuario/perfil/viajes/detalle-viajes/detalle-viajes.module').then( m => m.DetalleViajesPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },
  {
    path: 'qr-scan',
    loadChildren: () => import('./pages/usuario/qr-scan/qr-scan.module').then( m => m.QrScanPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },
  {
    path: 'programar-viaje',
    loadChildren: () => import('./pages/usuario/programar-viaje/programar-viaje.module').then( m => m.ProgramarViajePageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },
  {
    path: 'loginp',
    loadChildren: () => import('./pages/auth/provedores/login/login.module').then( m => m.LoginPageModule),
    canActivate: [authGuard], //* Protegido por authGuard en caso de que el usuario este logeado.
  },  {
    path: 'viajes-disponibles',
    loadChildren: () => import('./pages/usuario/viajes-disponibles/viajes-disponibles.module').then( m => m.ViajesDisponiblesPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
