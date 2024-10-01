import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarChoferPage } from './agregar-chofer.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarChoferPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarChoferPageRoutingModule {}
