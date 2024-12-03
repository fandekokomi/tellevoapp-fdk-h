import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { FirebaseError } from 'firebase/app';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private menu: MenuController,
    private usuarioService: UsuarioService,
    private SwalService: SwalService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      pass: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.menu.enable(false);
    this.usuarioService.logout();
  }

  register(){
    this.router.navigate(['/register']);
  }

  loginp(){
    this.router.navigate(['/loginp']);
  }

  //* Mostrar los errores del formulario de login
  async mostrarErroresLogin() {
    const emailControl = this.loginForm.get('email');
    const passControl = this.loginForm.get('pass');

    if (emailControl?.hasError('required')) {
      await this.SwalService.error('El correo electronico es requerido');
      return;
    }

    if (emailControl?.hasError('email')) {
      await this.SwalService.error('El correo electronico es invalido');
      return;
    }

    if (passControl?.hasError('required')) {
      await this.SwalService.error('La contraseña es requerida');
      return;
    }
  }

  //* Metodo para logear al usuario
  async login() {
    if (this.loginForm.valid) {
      try {
        //* Mostrar el SweetAlert de carga
        this.SwalService.loading('Iniciando sesión, porfavor espere...');
  
        //* Intentar iniciar sesión con Firebase
        const usuarioFirebase = await this.usuarioService.login(
          this.loginForm.get('email')!.value as string,
          this.loginForm.get('pass')!.value as string
        );
  
        //* Comprobar si hay un usuario
        if (usuarioFirebase && usuarioFirebase.user) {
          const user = await this.usuarioService.getUsuarioByUID(usuarioFirebase.user.uid);
          this.menu.enable(true);
  
          //* Redirigir según el tipo de usuario
          if (user && user.tipo === 'admin') {
            this.loginForm.reset();
            this.router.navigate(['adminDashboard']);
          } else {
            this.loginForm.reset();
            this.router.navigate(['home']);
          }
  
          //* Cerrar el SweetAlert de carga
          this.SwalService.cerrar();
        }

      } catch (error: any) {
        this.SwalService.cerrar();
        //* Manejar errores de firebase
        if(error instanceof FirebaseError){
          let mensajeError;
          if (error.code === 'auth/invalid-credential') {
            mensajeError = 'Las credenciales proporcionadas son incorrectas';
          } else {
            mensajeError = 'Error desconocido...'
            console.log(error)
          }
          await this.SwalService.error(mensajeError);
        } else {
          await this.SwalService.error(error.message);
        }
      }
    } else {
      //* Mostrar errores específicos del formulario
      this.mostrarErroresLogin();
      this.loginForm.markAllAsTouched();
    }
  }    

  recuperarContrasena() {
    this.router.navigate(['recuperar-contrasena']);
  }
}