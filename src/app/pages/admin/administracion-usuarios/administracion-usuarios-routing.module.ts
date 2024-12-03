import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministracionUsuariosPage } from './administracion-usuarios.page';

const routes: Routes = [
  {
    path: '',
    component: AdministracionUsuariosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministracionUsuariosPageRoutingModule {}
