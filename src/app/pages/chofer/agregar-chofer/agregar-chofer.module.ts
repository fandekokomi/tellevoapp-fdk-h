import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Importa ReactiveFormsModule

import { IonicModule } from '@ionic/angular';

import { AgregarChoferPageRoutingModule } from './agregar-chofer-routing.module';

import { AgregarChoferPage } from './agregar-chofer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AgregarChoferPageRoutingModule
  ],
  declarations: [AgregarChoferPage]
})
export class AgregarChoferPageModule {}
