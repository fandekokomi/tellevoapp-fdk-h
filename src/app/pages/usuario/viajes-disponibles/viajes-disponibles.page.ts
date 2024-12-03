import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { latLng, LatLng } from 'leaflet';
import { Viaje } from 'src/app/interfaces/viaje';
import { NavigationService } from 'src/app/services/navigation.service';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-viajes-disponibles',
  templateUrl: './viajes-disponibles.page.html',
  styleUrls: ['./viajes-disponibles.page.scss'],
})
export class ViajesDisponiblesPage implements OnInit {
  filtroDestino: string = '';
  viajes: Viaje[] = [];
  viajesFiltrados: Viaje[] = [];
  paginaActual: number = 1;
  viajesPorPagina: number = 3;
  totalPaginas!: number;

  constructor(
    private viajeService: ViajeService,
    private usuarioService: UsuarioService,
    private SwalService: SwalService,
    private ns: NavigationService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.viajes = await this.viajeService.getViajes();
    this.filtrarViajesEnEspera(); //* Filtrar solo viajes en espera
  }

  filtrarViajesEnEspera() {
    this.viajesFiltrados = this.viajes.filter(viaje => viaje.estado === 'en espera');
    this.calcularTotalPaginas(); //* Calcula totalPaginas después de filtrar
  }

  filtrarPorDestino() {
    const filtro = this.filtroDestino.toLowerCase(); //* Utilizar la variable de filtro
    if (filtro) {
      this.viajesFiltrados = this.viajesFiltrados.filter(viaje =>
        viaje.destino.toLowerCase().includes(filtro)
      );
    } else {
      this.filtrarViajesEnEspera(); //* Refiltrar si no hay filtro
    }
    this.calcularTotalPaginas(); //* Actualizar totalPaginas
  }

  calcularTotalPaginas() {
    const calculo = Math.ceil(this.viajesFiltrados.length / this.viajesPorPagina);
    this.totalPaginas = calculo == 0 ? 1:calculo;
  }

  //* Convierte las coordenadas a un formato plano
  convertLatLngToPlain(latLng: LatLng) {
    return {
      lat: latLng.lat,
      lng: latLng.lng,
    };
  }

  async unirseAlViaje(viaje: Viaje) {
    this.SwalService.loading('Uniendose al viaje, por favor espere...');
    try {
      const user = await this.usuarioService.getCurrentUser();
    if (user) {
      if (viaje.estado === 'en espera') {
        if (viaje.personas.length < viaje.cantidadPersonas) {
          if (viaje.personas.includes(user.uid)) {
            this.SwalService.error('Ya estás ingresado en este viaje');
            return
          }
          viaje.destinoCoords = this.convertLatLngToPlain(latLng(viaje.destinoCoords.lat, viaje.destinoCoords.lng));
          viaje.origenCoords = this.convertLatLngToPlain(latLng(viaje.origenCoords.lat, viaje.origenCoords.lng));
          const viajeEditado: Viaje = { ...viaje, origenCoords: viaje.origenCoords, destinoCoords: viaje.destinoCoords, personas: viaje.personas };

          await this.viajeService.editViaje(viajeEditado);
          this.SwalService.cerrar();
          this.SwalService.success('¡Te has unido al viaje exitosamente!').then(() => {
            this.ns.setNavigationData(latLng(viaje.origenCoords.lat, viaje.origenCoords.lng), latLng(viaje.destinoCoords.lat, viaje.destinoCoords.lng), viaje.origen, viaje.destino, viaje.cantidadPersonas, viaje.uid);
            this.router.navigate(['/mapa'], {replaceUrl: true});
          });
        } else {
          this.SwalService.cerrar();
          this.SwalService.error('¡El viaje ya tiene la cantidad máxima de personas!');
        }
      } else {
        this.SwalService.cerrar();
        this.SwalService.error(`Este viaje se encuentra ${viaje.estado}, no puedes unirte.`);
      }
    } else {
      this.SwalService.cerrar();
      this.SwalService.error('¡No se pudo verificar tu usuario, por favor intenta nuevamente!');
    }
    } catch (error) {
      console.log(error);
      this.SwalService.cerrar();
      this.SwalService.error('Error uniendose al viaje');
    }
  }

  previous() {
    if (this.paginaActual > 1) this.paginaActual--;
  }

  next() {
    const totalPaginas = Math.ceil(this.viajesFiltrados.length / this.viajesPorPagina);
    if (this.paginaActual < totalPaginas) this.paginaActual++;
  }
}