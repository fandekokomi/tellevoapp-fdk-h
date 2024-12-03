import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditarViajeModalComponent } from 'src/app/components/AdminComponents/editar-viaje-modal/editar-viaje-modal.component'; // Asegúrate de crear este modal
import { Viaje } from '../../../interfaces/viaje';
import { ViajeService } from 'src/app/services/viaje.service';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-administracion-viajes',
  templateUrl: './administracion-viajes.page.html',
  styleUrls: ['./administracion-viajes.page.scss'],
})
export class AdministracionViajesPage implements OnInit {
  viajes: Viaje[] = [];
  viajesPaginados: Viaje[] = [];
  paginaActual: number = 1;
  viajesPorPagina: number = 3;
  totalPaginas: number = 1;

  constructor(
    private modalController: ModalController,
    private viajeService: ViajeService,
    private SwalService: SwalService
  ) {}

  ngOnInit() {
    this.cargarViajes();
  }

  async cargarViajes() {
    this.viajes = await this.viajeService.getViajes();
    this.actualizarViajesPaginados();
  }

  private actualizarViajesPaginados() {
    const inicio = (this.paginaActual - 1) * this.viajesPorPagina;
    const fin = inicio + this.viajesPorPagina;

    this.viajesPaginados = this.viajes.slice(inicio, fin);
    this.totalPaginas = Math.ceil(this.viajes.length / this.viajesPorPagina);
  }

  async editarViaje(index: number) {
    const viaje = this.viajesPaginados[index];

    const modal = await this.modalController.create({
      component: EditarViajeModalComponent,
      componentProps: { viaje },
    });

    modal.onDidDismiss().then(async () => {
      await this.cargarViajes(); //* Recargar viajes después de la edición
    });

    return await modal.present();
  }

  public previous() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarViajesPaginados();
    }
  }

  public next() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarViajesPaginados();
    }
  }

  public async eliminarViaje(uid: string) {
    const viaje = this.viajes.find((v) => v.uid === uid);

    //* Verificar que el viaje existe
    if (!viaje) {
      this.SwalService.error('Viaje no encontrado.');
      return;
    }

    console.log(
      'UID del viaje a eliminar:',
      viaje.uid,
      'Tipo:',
      typeof viaje.uid
    );

    const confirm = await this.SwalService.warning(
      'Confirmar Eliminación',
      `¿Está seguro de que desea eliminar el viaje desde ${viaje.origen} a ${viaje.destino}?`,
      'Confirmar'
    );

    if (confirm.isConfirmed) {
      this.SwalService.loading(
        `Eliminando viaje desde ${viaje.origen} a ${viaje.destino}, por favor espere...`
      );

      try {
        //* Eliminar el viaje usando el uid
        const eliminado = await this.viajeService.deleteViaje(viaje.uid);
        if (eliminado) {
          this.viajes = this.viajes.filter((v) => v.uid !== viaje.uid);
          this.totalPaginas = Math.ceil(
            this.viajes.length / this.viajesPorPagina
          );
          if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas;
          }
          this.SwalService.cerrar();
          await this.SwalService.success(
            `¡El viaje desde ${viaje.origen} a ${viaje.destino} ha sido eliminado con éxito!`
          );
          this.actualizarViajesPaginados();
        } else {
          this.SwalService.error(
            `No se pudo eliminar el viaje desde ${viaje.origen} a ${viaje.destino}`
          );
        }
      } catch (error) {
        console.error('Error al eliminar viaje:', error);
        if (error instanceof Error) {
          this.SwalService.error(
            `Error al eliminar el viaje: ${error.message}`
          );
        } else {
          this.SwalService.error('Error desconocido al eliminar el viaje.');
        }
      }
    }
  }
}
