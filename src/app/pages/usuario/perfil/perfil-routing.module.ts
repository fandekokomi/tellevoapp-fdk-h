import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPage } from './perfil.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPage,
    children: [
      {
        path: 'detalles',
        loadChildren: () => import('./detalles/detalles.module').then( m => m.DetallesPageModule)
      },
      {
        path: 'historial-viajes',
        loadChildren: () => import('./viajes/historial-viajes/historial-viajes.module').then(m => m.HistorialViajesPageModule)
      },
      {
        path: 'vehiculos',
        loadChildren: () => import('./vehiculos/vehiculos.module').then( m => m.VehiculosPageModule)
      },
      {
        path: '',
        redirectTo: 'detalles',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '' //* Redirige a la ruta base
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPageRoutingModule {}