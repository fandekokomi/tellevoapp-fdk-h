import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleChoferesPageRoutingModule } from './detalle-choferes-routing.module';

import { DetalleChoferesPage } from './detalle-choferes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleChoferesPageRoutingModule
  ],
  declarations: [DetalleChoferesPage]
})
export class DetalleChoferesPageModule {}
