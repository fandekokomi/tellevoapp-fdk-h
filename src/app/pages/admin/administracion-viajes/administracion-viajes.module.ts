import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdministracionViajesPageRoutingModule } from './administracion-viajes-routing.module';

import { AdministracionViajesPage } from './administracion-viajes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdministracionViajesPageRoutingModule
  ],
  declarations: [AdministracionViajesPage]
})
export class AdministracionViajesPageModule {}
