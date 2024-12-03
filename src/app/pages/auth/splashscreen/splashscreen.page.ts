import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { NativeBiometric } from 'capacitor-native-biometric';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-splashscreen',
  templateUrl: './splashscreen.page.html',
  styleUrls: ['./splashscreen.page.scss'],
})
export class SplashscreenPage implements OnInit {
  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private firestore: AngularFirestore,
    private SwalService: SwalService
  ) {}

  async ngOnInit() {
    await this.checkLogin();
  }

  async checkLogin() {
    const user = await firstValueFrom(this.usuarioService.isLogged());
    
    if (user) {
      try {
        const usuarioDoc = await firstValueFrom(
          this.firestore.collection('usuarios').doc(user.uid).get()
        );
        
        const userData = usuarioDoc.data() as Usuario;

        //* Verifica que la data exista
        if (!userData || !userData.tipo) {
          //* Si la data del usuario no está, regresa.
          return;
        }

        await this.checkHuellaDigital();

        //* El usuario esta logeado y su data está completa
        if (userData.tipo === 'admin') {
          this.router.navigate(['/adminDashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      } catch (error: any) {
        await this.SwalService.error(`Error: ${error.message}, vuelva a iniciar sesión.`).then(() => {
          this.usuarioService.logout();
          this.router.navigate(['/login'], { replaceUrl: true });
        });
      }
    } else {
      //* El usuario no está logeado
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }
  
  async checkHuellaDigital() {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Por favor, autentícate para continuar',
        title: 'Autenticación Biométrica',
        subtitle: 'Usa tu huella digítal',
        description: 'Coloca tu huella en el sensor para ingresar.',
      });
    } catch (error) {
      throw error; //* Forzamos el error para capturarlo.
    }
  }
}