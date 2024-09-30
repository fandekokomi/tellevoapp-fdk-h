import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdministracionViajesPage } from './administracion-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: AdministracionViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdministracionViajesPageRoutingModule {}
