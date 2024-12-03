import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { EditarUsuarioModalComponent } from './components/AdminComponents/editar-usuario-modal/editar-usuario-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgregarVehiculoModalComponent } from './components/agregar-vehiculo-modal/agregar-vehiculo-modal.component';
import { EditarViajeModalComponent } from './components/AdminComponents/editar-viaje-modal/editar-viaje-modal.component';

//*Import de base de datos firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    EditarUsuarioModalComponent,
    AgregarVehiculoModalComponent,
    EditarViajeModalComponent
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot({mode: 'md'}), 
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
