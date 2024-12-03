import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { Viaje } from 'src/app/interfaces/viaje';
import { SwalService } from 'src/app/services/swal.service';
import { LatLng, latLng } from 'leaflet';

@Component({
  selector: 'app-detalle-viajes',
  templateUrl: './detalle-viajes.page.html',
  styleUrls: ['./detalle-viajes.page.scss'],
})
export class DetalleViajesPage implements OnInit {
  viaje: Viaje | undefined;

  constructor(
    private viajeService: ViajeService,
    private route: ActivatedRoute,
    private router: Router,
    private navigationService: NavigationService,
    private SwalService: SwalService
  ) {}

  ngOnInit() {
    let uid = this.route.snapshot.paramMap.get('uid')!;
    this.viajeService.getViajePorUID(uid).then((viaje) => {
      this.viaje = viaje;
    });
  }

  convertToLatLng(coords: LatLng | { lat: number; lng: number }): LatLng {
    if (coords instanceof LatLng) {
      //* Si ya es un LatLng, lo retorna directamente
      return coords;
    } else {
      //* Si es un objeto con lat y lng, lo convierte a LatLng
      return latLng(coords.lat, coords.lng);
    }
  }
  
  repetirViaje() {
    if (this.viaje) {
      const origenCoords = this.convertToLatLng(this.viaje.origenCoords);
      const destinoCoords = this.convertToLatLng(this.viaje.destinoCoords);
      const { origen, destino, cantidadPersonas } = this.viaje;
  
      //* Guardar los datos en el NavigationService
      this.navigationService.setNavigationData(
        origenCoords,
        destinoCoords,
        origen,
        destino,
        cantidadPersonas, this.viaje.uid
      );
  
      //* Redirigir al mapa
      this.router.navigate(['/mapa'], { replaceUrl: true });
    }
  }

  async eliminarViaje() {
    try {
      this.SwalService.loading('Eliminando viaje, por favor espere...');

      await this.viajeService.deleteViaje(this.route.snapshot.paramMap.get('uid')!)

      this.SwalService.success('¡Viaje eliminado con éxito!').then(() => {
        this.router.navigate(['/historial-viajes'], {replaceUrl: true});
      });

    } catch (error: any) {
      this.SwalService.error('Error al eliminar el viaje.');
    }
  }
}