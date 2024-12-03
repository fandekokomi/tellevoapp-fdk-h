import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViajesDisponiblesPage } from './viajes-disponibles.page';

const routes: Routes = [
  {
    path: '',
    component: ViajesDisponiblesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViajesDisponiblesPageRoutingModule {}
