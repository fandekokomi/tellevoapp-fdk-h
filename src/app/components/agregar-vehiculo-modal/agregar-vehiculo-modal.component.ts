import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { ModalController } from '@ionic/angular';
import { Vehiculo } from 'src/app/interfaces/vehiculo';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-agregar-vehiculo-modal',
  templateUrl: './agregar-vehiculo-modal.component.html',
  styleUrls: ['./agregar-vehiculo-modal.component.scss'],
})
export class AgregarVehiculoModalComponent implements OnInit {
  vehiculoForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private vehiculoService: VehiculoService,
    private modalCtrl: ModalController, //* Agregamos el ModalController
    private firestore: AngularFirestore,
    private SwalService: SwalService
  ) {
    this.vehiculoForm = this.formBuilder.group({
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      matricula: ['', [Validators.required, Validators.minLength(2)]],
      color: [''],
    });
  }

  ngOnInit() {}

  //* Método para agregar el vehículo
  async agregarVehiculo() {
    try {
      const currentUser = await this.usuarioService.getCurrentUser();
      if (currentUser) {
        const vehiculo: Vehiculo = {
          uid: this.firestore.createId(), //* Firebase debería autogenerar el UID
          usuarioUID: currentUser.uid,
          marca: this.vehiculoForm.get('marca')?.value,
          modelo: this.vehiculoForm.get('modelo')?.value,
          matricula: this.vehiculoForm.get('matricula')?.value,
          color: this.vehiculoForm.get('color')?.value,
        };

        //* Agregar el vehículo
        await this.vehiculoService.addVehiculo(vehiculo);

        this.SwalService.success('El vehículo se ha registrado correctamente!').then(() => {
          this.cerrarModal(); //* Cerrar el modal después de agregar
        });
      } else {
        this.SwalService.error('No se ha podido verificar tu sesión. Por favor, inténtalo nuevamente.');
      }
    } catch (error) {
      this.SwalService.error('Error al agregar vehículo. Por favor, inténtalo de nuevo.');
    }
  }

  //* Método para cerrar el modal
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}
