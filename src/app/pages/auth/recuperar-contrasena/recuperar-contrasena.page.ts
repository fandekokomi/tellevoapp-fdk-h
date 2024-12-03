import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { SwalService } from 'src/app/services/swal.service';

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
    private usuarioService: UsuarioService,
    private SwalService: SwalService
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
        //* Ahora es un alert de loading directo del swal service.
        this.SwalService.loading('Enviando correo, porfavor espere...');
  
        //* Intentar enviar el correo de recuperación
        await this.usuarioService.recoveryPassword(email);
  
        //* Si el correo se envía exitosamente
        this.SwalService.cerrar();
        await this.SwalService.success('El correo se envió correctamente').then(() => {
          this.router.navigate(['login']);
        });
  
      } catch (error) {
        //* Mostrar mensaje de error si ocurre un problema
        this.SwalService.error('¡El correo no existe o ha ocurrido un error al enviar el correo!');
      }
    } else {
      //* Mostrar error si el formulario no es válido
      this.SwalService.error('¡El formulario no es válido!');
    }
  }  
}
