import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViajesDisponiblesPageRoutingModule } from './viajes-disponibles-routing.module';

import { ViajesDisponiblesPage } from './viajes-disponibles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViajesDisponiblesPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ViajesDisponiblesPage]
})
export class ViajesDisponiblesPageModule {}
