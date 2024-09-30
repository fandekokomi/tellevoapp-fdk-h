import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { Viaje } from 'src/app/interfaces/viaje';

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
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    //this.viaje = this.viajeService.getViajes().find(v => v.id === id);
  }

  repetirViaje() {
    if (this.viaje) {
      const { origenCoords, destinoCoords, origen, destino, cantidadPersonas } = this.viaje;

      // Guardar los datos en el NavigationService
      this.navigationService.setNavigationData(
        origenCoords,
        destinoCoords,
        origen,
        destino,
        cantidadPersonas
      );

      // Redirigir al mapa
      this.router.navigate(['/mapa']);
    }
  }

  eliminarViaje() {
  }
}