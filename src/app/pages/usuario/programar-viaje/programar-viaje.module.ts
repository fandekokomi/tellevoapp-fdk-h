import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProgramarViajePageRoutingModule } from './programar-viaje-routing.module';

import { ProgramarViajePage } from './programar-viaje.page';

import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProgramarViajePageRoutingModule,
    ReactiveFormsModule,
    QrCodeModule
  ],
  declarations: [ProgramarViajePage]
})
export class ProgramarViajePageModule {}
