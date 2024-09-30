import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
})
export class RecuperarContrasenaPage implements OnInit {
  fpassForm: FormGroup;
  constructor(
    private menu: MenuController,
    private router: Router,
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService
  ) {
    this.fpassForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
   }

  ngOnInit() {
    this.menu.enable(false);
  }

  async recoveryEmail() {
    if (this.fpassForm.valid) {
      const email = this.fpassForm.get('email')?.value;
  
      try {
        //* Mostrar SweetAlert de "Cargando" inmediatamente
        Swal.fire({
          title: "Cargando",
          html: "Enviando correo, por favor espere...",
          timerProgressBar: true,
          heightAuto: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
  
        //* Intentar enviar el correo de recuperación
        await this.usuarioService.recoveryPassword(email);
  
        //* Si el correo se envía exitosamente
        Swal.fire({
          title: 'Correo enviado!',
          text: 'El correo se ha enviado exitosamente!',
          icon: 'success',
          showConfirmButton: true,
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['login']);
        });
  
      } catch (error) {
        //* Mostrar mensaje de error si ocurre un problema
        Swal.fire({
          title: 'ERROR!',
          text: 'El correo no existe o ha ocurrido un error al enviar el correo!',
          icon: 'error',
          showConfirmButton: true,
          confirmButtonText: 'Reintentar',
          heightAuto: false
        });
      }
    } else {
      //* Mostrar error si el formulario no es válido
      Swal.fire({
        title: 'ERROR!',
        text: 'El formulario no es válido!',
        icon: 'error',
        showConfirmButton: true,
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
    }
  }  
}
