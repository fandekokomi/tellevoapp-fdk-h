import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';

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
    private SwalService: SwalService
  ) {
    this.registerForm = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ]{3,15}$/)
      ]],
      apellido: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-záéíóúÁÉÍÓÚñÑ]{3,15}$/)
      ]],      
      tipoUsuario: ['', [ 
        Validators.required
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

  async generateRandomUsers() {
    await this.usuarioService.generarUsuariosAleatorios();
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
    const apellido = this.registerForm.get('apellido')?.value;
    const tipoUsuario = this.registerForm.get('tipoUsuario')?.value;
    const email = this.registerForm.get('email')?.value;
    const pass = this.registerForm.get('pass')?.value;
    
    this.SwalService.loading('Registrando al usuario, porfavor espere...');
    try {
      const user = await this.usuarioService.register(email, pass, tipoUsuario, nombre, apellido);
      if (user) {
        this.SwalService.cerrar();
        await this.SwalService.success('¡Cuenta creada correctamente!').then(() => {
          this.registerForm.reset();
          this.router.navigate(['login']);
        });
      }
    } catch (error: any) {
      //* Manejar error de correo ya en uso
      if (error.code === 'auth/email-already-in-use') {
        await this.SwalService.error('El correo electrónico ya está en uso por otra cuenta.');
      } else {
        await this.SwalService.error('Hubo un error en las credenciales, intentelo nuevamente.');
      }
    }
  }

  async mostrarErrores() {
    const nombreControl = this.registerForm.get('nombre');
    const apellidoControl = this.registerForm.get('apelido');
    const tipoUsuarioControl = this.registerForm.get('tipoUsuario')?.value;
    const emailControl = this.registerForm.get('email');
    const passControl = this.registerForm.get('pass');
    const verificarPassControl = this.registerForm.get('verificarPass');
  
    if (nombreControl?.hasError('required')) {
      await this.SwalService.error('El nombre es requerido');
      return;
    }
  
    if (nombreControl?.hasError('pattern')) {
      await this.SwalService.error('El nombre es inválido. Debe contener solo letras y tener una longitud de 3 a 15 caracteres.');
      return;
    }

    if (apellidoControl?.hasError('required')){
      await this.SwalService.error('El apellido es requerido');
    }

    if (apellidoControl?.hasError('pattern')) {
      await this.SwalService.error('El apellido es inválido. Debe contener solo letras y tener una longitud de 3 a 15 caracteres.');
    }

    if (tipoUsuarioControl?.hasError('required')){
      await this.SwalService.error('El tipo de usuario es requerido');
    }
  
    if (emailControl?.hasError('required')) {
      await this.SwalService.error('El correo electrónico es requerido');
      return;
    }
  
    if (emailControl?.hasError('invalidDomain')) {
      await this.SwalService.error('El correo debe ser del dominio @duocuc.cl');
      return;
    }
  
    if (passControl?.hasError('required')) {
      await this.SwalService.error('La contraseña es requerida');
      return;
    }
  
    if (passControl?.hasError('invalidPassword')) {
      await this.SwalService.error('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }
  
    //* Verificar si la contraseña de verificación es requerida
    if (verificarPassControl?.hasError('required')) {
      await this.SwalService.error('Verificar la contraseña es requerido');
      return;
    }
  
    //* Verificar si las contraseñas coinciden
    if (this.registerForm.hasError('passwordMismatch')) {
      await this.SwalService.error('Las contraseñas no coinciden');
    }
  }
  
}