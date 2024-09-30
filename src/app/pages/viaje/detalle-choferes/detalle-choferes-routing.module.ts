import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleChoferesPage } from './detalle-choferes.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleChoferesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleChoferesPageRoutingModule {}
