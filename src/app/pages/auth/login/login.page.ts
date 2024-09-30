import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FirebaseError } from 'firebase/app';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

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

  //* Mostrar los errores del formulario de login
  async mostrarErroresLogin() {
    const emailControl = this.loginForm.get('email');
    const passControl = this.loginForm.get('pass');

    if (emailControl?.hasError('required')) {
      await Swal.fire({
        title: 'Error',
        text: 'El correo electrónico es requerido',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }

    if (emailControl?.hasError('email')) {
      await Swal.fire({
        title: 'Error',
        text: 'El correo electrónico es inválido',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }

    if (passControl?.hasError('required')) {
      await Swal.fire({
        title: 'Error',
        text: 'La contraseña es requerida',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }
  }

  //* Metodo para logear al usuario
  async login() {
    if (this.loginForm.valid) {
      try {
        //* Mostrar el SweetAlert de carga
        Swal.fire({
          title: "Cargando",
          html: "Iniciando sesión, por favor espere...",
          timerProgressBar: true,
          heightAuto: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
  
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
          Swal.close();
        }

      } catch (error) {
        //* Manejar errores de firebase
        if(error instanceof FirebaseError){
          let mensajeError;
          if (error.code === 'auth/invalid-credential') {
            mensajeError = 'Las credenciales proporcionadas son incorrectas';
          } else {
            mensajeError = 'Error desconocido...'
            console.log(error)
          }
          Swal.fire({
            title: 'ERROR!',
            text: mensajeError,
            icon: 'error',
            showConfirmButton: true,
            confirmButtonText: 'Reintentar',
            heightAuto: false
          });
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