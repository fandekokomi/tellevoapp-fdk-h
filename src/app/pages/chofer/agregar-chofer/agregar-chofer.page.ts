import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/services/usuario.service';
import { VehiculoService } from 'src/app/services/vehiculo.service'; 
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Vehiculo } from 'src/app/interfaces/vehiculo';

@Component({
  selector: 'app-agregar-chofer',
  templateUrl: './agregar-chofer.page.html',
  styleUrls: ['./agregar-chofer.page.scss'],
})
export class AgregarChoferPage implements OnInit {
  choferForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private vehiculoService: VehiculoService,
    private router: Router
  ) {
    this.choferForm = this.formBuilder.group({
      marca: ['', [Validators.required, Validators.minLength(2)]],
      modelo: ['', [Validators.required, Validators.minLength(2)]],
      matricula: ['', [Validators.required, Validators.minLength(2)]],
      color: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit() {}

  //* Método para agregar el vehículo
  async agregarVehiculo() {
    const currentUser = await this.usuarioService.getCurrentUser();
    if (currentUser) {
      console.log('Usuario actual:', currentUser);

      const vehiculo: Vehiculo = {
        uid: '', //* Firebase debería autogenerar el UID
        usuarioUID: currentUser.uid, 
        marca: this.choferForm.get('marca')?.value,
        modelo: this.choferForm.get('modelo')?.value,
        matricula: this.choferForm.get('matricula')?.value,
        color: this.choferForm.get('color')?.value
      };

      //* Agregar el vehículo
      await this.vehiculoService.addVehiculo(vehiculo);

      Swal.fire({
        title: 'Vehículo agregado!',
        text: 'El vehículo se ha registrado correctamente!',
        icon: 'success',
        confirmButtonText: 'OK',
        heightAuto: false
      }).then(() => {
        this.router.navigate(['home']);
      });
    } else {
      console.log('No se pudo obtener el usuario actual');
    }
  }

  //* Método para convertir al usuario en chofer
  async convertirEnChofer() {
    if (this.choferForm.invalid) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, completa todos los campos requeridos.',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
      return; 
    }
  
    try {
      const currentUser = await this.usuarioService.getCurrentUser();
      if (currentUser) {
        console.log('Usuario actual antes de cambiar a chofer:', currentUser);
  
        await this.usuarioService.updateUsuario(currentUser.email, { tipo: 'chofer' });
  
        await this.agregarVehiculo();
  
        Swal.fire({
          title: 'Éxito!',
          text: 'Te has convertido en chofer!',
          icon: 'success',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['home']);
        });
      } else {
        console.log('No se pudo obtener el usuario actual');
      }
    } catch (error) {
      console.error('Error al convertir en chofer:', error);
      Swal.fire({
        title: 'ERROR!',
        text: 'No se pudo convertir en chofer',
        icon: 'error',
        confirmButtonText: 'Reintentar',
        heightAuto: false
      });
    }
  }
}  