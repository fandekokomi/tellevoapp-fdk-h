import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private menu: MenuController,
    private usuarioService: UsuarioService,
    private SwalService: SwalService
  ) {}

  ngOnInit() {
    this.menu.enable(false);
    this.usuarioService.logout();
  }

  loginWithEmailAndPassword(){
    this.router.navigate(['/login'], {replaceUrl: true});
  }

  //* Login con Git
  async loginGit() {
    console.log('Intentando iniciar sesión');
    this.SwalService.loading('Iniciando sesión con GitHub');
    
    try {
      await this.usuarioService.loginWithProvider('github');

      if (!await this.usuarioService.getCurrentUser()) {
        //* Después de autenticación, solicitamos datos adicionales con SweetAlert
        const formValues = await this.SwalService.providerForm();
        if (formValues) {
          const { nombre, apellido, tipoUsuario } = formValues;
          //* Registramos al usuario con los datos adicionales
          await this.usuarioService.completeRegisterWithProvider(nombre, apellido, tipoUsuario, 'github');
        }
      }
      this.SwalService.cerrar();
      this.router.navigate(['/home'], { replaceUrl: true }); //* Por ahora, redirige a home, luego será redireccionado según el tipo de usuario.
    } catch (error: any) {
      this.SwalService.error(`No se pudo iniciar sesión con GitHub: ${error.message}`);
    }
  } 
  
  //* Login con Google
  async loginGoogle() {
    console.log('Intentando iniciar sesión con Google');
    this.SwalService.loading('Iniciando sesión con Google');
    
    try {
      await this.usuarioService.loginWithProvider('google');
    
      if (!await this.usuarioService.getCurrentUser()) {
        //* Espera a que el usuario complete el formulario
        const formValues = await this.SwalService.providerForm();
        
        //* Si el usuario completó el formulario
        if (formValues) {
          const { nombre, apellido, tipoUsuario } = formValues;
          await this.usuarioService.completeRegisterWithProvider(nombre, apellido, tipoUsuario, 'google');
        } else {
          //* Maneja el caso en que el formulario fue cancelado
          this.SwalService.error('Registro cancelado. Por favor, completa el registro para continuar.');
          return;
        }
      }
      
      //* Redirige a home si todo salió bien
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (error: any) {
      this.SwalService.error(`No se pudo iniciar sesión con Google: ${error.message}`);
    } finally {
      //* Cierra el mensaje de carga independientemente del resultado
      this.SwalService.cerrar();
    }
  }  
  
}