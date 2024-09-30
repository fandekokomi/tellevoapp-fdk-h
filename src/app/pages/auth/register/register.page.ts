import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm!: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private menu: MenuController,
    private usuarioService: UsuarioService,
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{3,15}$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        this.emailDomainValidator
      ]],
      pass: ['', [Validators.required, this.passwordValidator]],
      verificarPass: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.menu.enable(false);
  }

  //* Validador para verificar que el correo sea del dominio @duocuc.cl
  emailDomainValidator(control: AbstractControl) {
    const email = control.value;
    if (email && email.indexOf('@') !== -1) {
      const [_, domain] = email.split('@');
      if (domain !== 'duocuc.cl') {
        return { invalidDomain: true };
      }
    }
    return null;
  }

  //* Validador para verificar que las contraseñas coincidan
  passwordsMatchValidator(group: AbstractControl) {
    const pass = group.get('pass')?.value;
    const verificarPass = group.get('verificarPass')?.value;
    return pass === verificarPass ? null : { passwordMismatch: true };
  }

  //* Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password?.length >= 8;

    //* El validador puede ser adaptado según necesidades futuras
    const passwordValid = hasUpperCase && hasNumber && hasMinLength;

    return !passwordValid ? { invalidPassword: true } : null;
  }

  async registrarse() {
    if (this.registerForm.invalid) {
      this.mostrarErrores();
      return;
    }
  
    const nombre = this.registerForm.get('nombre')?.value;
    const email = this.registerForm.get('email')?.value;
    const pass = this.registerForm.get('pass')?.value;
  
    Swal.fire({
      title: 'Cargando',
      html: 'Registrando el usuario, por favor espere...',
      allowOutsideClick: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      const user = await this.usuarioService.register(email, pass, 'usuario', nombre);
      if (user) {
        Swal.close();
        Swal.fire({
          title: 'Éxito!',
          text: 'Cuenta creada correctamente!',
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['login']);
        });
      }
    } catch (error: any) {
      //* Manejar error de correo ya en uso
      if (error.code === 'auth/email-already-in-use') {
        await Swal.fire({
          title: 'ERROR!',
          text: 'El correo electrónico ya está en uso por otra cuenta.',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Reintentar',
          heightAuto: false
        });
      } else {
        await Swal.fire({
          title: 'ERROR!',
          text: 'Error en las credenciales, intentelo nuevamente!',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Reintentar',
          heightAuto: false
        });
      }
    }
  }

  async mostrarErrores() {
    const nombreControl = this.registerForm.get('nombre');
    const emailControl = this.registerForm.get('email');
    const passControl = this.registerForm.get('pass');
    const verificarPassControl = this.registerForm.get('verificarPass');
  
    if (nombreControl?.hasError('required')) {
      await Swal.fire({
        title: 'Error',
        text: 'El nombre de usuario es requerido',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }
  
    if (nombreControl?.hasError('pattern')) {
      await Swal.fire({
        title: 'Error',
        text: 'El nombre de usuario es inválido. Debe contener solo letras, números y caracteres especiales, con una longitud de 3 a 15 caracteres.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }
  
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
  
    if (emailControl?.hasError('invalidDomain')) {
      await Swal.fire({
        title: 'Error',
        text: 'El correo debe ser del dominio @duocuc.cl',
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
  
    if (passControl?.hasError('invalidPassword')) {
      await Swal.fire({
        title: 'Error',
        text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }
  
    //* Verificar si la contraseña de verificación es requerida
    if (verificarPassControl?.hasError('required')) {
      await Swal.fire({
        title: 'Error',
        text: 'Verificar la contraseña es requerido',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return;
    }
  
    //* Verificar si las contraseñas coinciden
    if (this.registerForm.hasError('passwordMismatch')) {
      await Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
    }
  }
}