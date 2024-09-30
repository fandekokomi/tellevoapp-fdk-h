import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-usuario-modal',
  templateUrl: './editar-usuario-modal.component.html',
  styleUrls: ['./editar-usuario-modal.component.scss'],
})
export class EditarUsuarioModalComponent implements OnInit {
  form: FormGroup;
  usuario!: Usuario; //* Este será el usuario que se va a editar

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private modalController: ModalController
  ) {
    //* Inicializa el formulario con los campos
    this.form = this.formBuilder.group({
      uid: ['', Validators.required],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tipo: ['', Validators.required]
    });    
  }

  ngOnInit() {
    //* Cargar datos del usuario que se va a editar
    if (this.usuario) {
      this.form.patchValue(this.usuario);
    }
  }

  //* Método para guardar el usuario
  async guardar() {
    if (this.form.valid) {
      const updatedUsuario = this.form.value;
      if (await this.usuarioService.updateUsuario(this.usuario.email, updatedUsuario)) {
        Swal.fire({
          title: 'Usuario editado',
          text: `¡El usuario con uid: ${updatedUsuario.uid} fue modificado con éxito!`,
          icon: 'info',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      } else {
        Swal.fire({
          title: 'Advertencia',
          text: `Hubo un error al modificar al usuario con uid: ${updatedUsuario.uid}`,
          icon: 'info',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      }
      this.modalController.dismiss(); //* Cierra el modal después de guardar
    } else {
      Swal.fire({
        title: 'ERROR',
        html: '¡El formulario no es valido!',
        confirmButtonText: 'Reintentar',
        showConfirmButton: true,
        heightAuto: false
      });
    }
  }

  //* Método para cancelar la edición
  cancelar() {
    this.modalController.dismiss();
  }
}