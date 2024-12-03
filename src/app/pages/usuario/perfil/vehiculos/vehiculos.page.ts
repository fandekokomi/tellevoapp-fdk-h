import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarVehiculoModalComponent } from 'src/app/components/agregar-vehiculo-modal/agregar-vehiculo-modal.component';
import { Vehiculo } from 'src/app/interfaces/vehiculo';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';

@Component({
  selector: 'app-vehiculos',
  templateUrl: './vehiculos.page.html',
  styleUrls: ['./vehiculos.page.scss'],
})
export class VehiculosPage implements OnInit {

  vehiculos: Vehiculo[] = [];
  vehiculosPaginados: Vehiculo[] = [];
  paginaActual: number = 1;
  vehiculosPorPagina: number = 3;
  totalPaginas: number = 1;

  constructor(private modalController: ModalController, private vehiculoService: VehiculoService, private SwalService: SwalService, private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.cargarVehiculos();
  }

  private actualizarVehiculosPaginados() {
    const inicio = (this.paginaActual - 1) * this.vehiculosPorPagina;
    const fin = inicio + this.vehiculosPorPagina;

    this.vehiculosPaginados = this.vehiculos.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.vehiculos.length / this.vehiculosPorPagina);
  }

  private async cargarVehiculos() {
    let userUID;
    this.usuarioService.currentUser$.subscribe((user) => {
      userUID = user!.uid;
    });
    this.vehiculos = (await this.vehiculoService.getVehiculosByUsuarioUID(userUID!));
    this.actualizarVehiculosPaginados();
  }

  public previous() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarVehiculosPaginados();
    }
  }

  public next() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarVehiculosPaginados();
    }
  }

  async editarVehiculo(index: number){
    await this.SwalService.info('Editar vehiculo no implementado');
  }

  async eliminarVehiculo(index: number){
    const vehiculoIndex = (this.paginaActual - 1) * this.vehiculosPorPagina + index;
    const vehiculo = this.vehiculos[vehiculoIndex];

    const confirm = await this.SwalService.warning('Confirmar Eliminación', `¿Está seguro de que desea eliminar el vehículo ${vehiculo.marca}: ${vehiculo.modelo}?`, 'Confirmar');
    if (confirm.isConfirmed) {
      this.SwalService.loading(`Eliminando vehiculo ${vehiculo.marca}: ${vehiculo.modelo}, por favor espere...`);
      if (await this.vehiculoService.deleteVehiculo(vehiculo.uid)) {
        this.vehiculos.splice(vehiculoIndex, 1);
          this.totalPaginas = Math.ceil(this.vehiculos.length / this.vehiculosPorPagina);
          if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas;
          }
          //* Cierra el loading y muestra un mensaje de éxito
          this.SwalService.cerrar();
          await this.SwalService.success(`¡El vehiculo ${vehiculo.marca}: ${vehiculo.modelo} ha sido eliminado con éxito!`);
          this.actualizarVehiculosPaginados();
      } else {
        this.SwalService.error(`No se pudo eliminar el vehiculo ${vehiculo.marca}: ${vehiculo.modelo}`);
      }
    }
  }

  async abrirModalVehiculo(){
    const modal = await this.modalController.create({
      component: AgregarVehiculoModalComponent,
    });

    modal.onDidDismiss().then(async () => {
      await this.cargarVehiculos(); //* Recargar todos los usuarios
    });

    return await modal.present();
  }
}
