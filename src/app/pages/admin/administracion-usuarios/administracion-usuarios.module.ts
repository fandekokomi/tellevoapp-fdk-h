import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdministracionUsuariosPageRoutingModule } from './administracion-usuarios-routing.module';

import { AdministracionUsuariosPage } from './administracion-usuarios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdministracionUsuariosPageRoutingModule
  ],
  declarations: [AdministracionUsuariosPage]
})
export class AdministracionUsuariosPageModule {}
