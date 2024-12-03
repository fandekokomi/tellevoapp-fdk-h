import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViajeService } from 'src/app/services/viaje.service';
import { Viaje } from 'src/app/interfaces/viaje';
import { ModalController } from '@ionic/angular';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-viaje-modal',
  templateUrl: './editar-viaje-modal.component.html',
  styleUrls: ['./editar-viaje-modal.component.scss'],
})
export class EditarViajeModalComponent implements OnInit {
  form: FormGroup;
  viaje!: Viaje; //* Este será el viaje que se va a editar

  constructor(
    private formBuilder: FormBuilder,
    private viajeService: ViajeService,
    private modalController: ModalController
  ) {
    //* Inicializa el formulario con los campos
    this.form = this.formBuilder.group({
      uid: ['', Validators.required],
      vehiculoUID: ['', Validators.required],
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      origenCoords: this.formBuilder.group({
        lat: [0, Validators.required],
        lng: [0, Validators.required]
      }),
      destinoCoords: this.formBuilder.group({
        lat: [0, Validators.required],
        lng: [0, Validators.required]
      }),
      cantidadPersonas: [0, [Validators.required, Validators.min(1)]],
      horaSalida: ['', Validators.required],
      personas: [[]], //* Este campo puede ser un array vacío por defecto,
      estado: ['', Validators.required]
    });
  }

  ngOnInit() {
    //* Cargar datos del viaje que se va a editar
    if (this.viaje) {
      this.form.patchValue(this.viaje);
    }
  }

  //* Método para guardar el viaje
  async guardar() {
    if (this.form.valid) {
      const updatedViaje = this.form.value;
      const result = await this.viajeService.updateViaje(this.viaje.uid, updatedViaje);
      if (result) {
        Swal.fire({
          title: 'Viaje editado',
          text: `¡El viaje con uid: ${updatedViaje.uid} fue modificado con éxito!`,
          icon: 'info',
          showConfirmButton: true,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });
      } else {
        Swal.fire({
          title: 'Advertencia',
          text: `Hubo un error al modificar el viaje con uid: ${updatedViaje.uid}`,
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
        html: '¡El formulario no es válido!',
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