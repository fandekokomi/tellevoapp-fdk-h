import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {
  viajes: any[] = [];

  constructor(
    private router: Router, 
    private viajeService: ViajeService, 
    private usuarioService: UsuarioService, 
    private vehiculoService: VehiculoService
  ) { }

  async ngOnInit() {
    const user = await this.usuarioService.getCurrentUser();

    if (user?.tipo === 'chofer') {
      //* Obtener todos los vehículos del chofer
      const vehiculos = await this.vehiculoService.getVehiculosByUsuarioUID(user.uid);
      const vehiculoUIDs = vehiculos.map((vehiculo) => vehiculo.uid);

      //* Filtrar viajes relacionados con los UID de los vehículos del chofer
      this.viajes = (await this.viajeService.getViajes()).filter(viaje => 
        vehiculoUIDs.includes(viaje.vehiculoUID)
      );
    } else {
      //* Filtrar los viajes donde el UID del usuario esté en el array de personas
      this.viajes = (await this.viajeService.getViajes()).filter(viaje => 
        viaje.personas.includes(user!.uid)
      );
    }
  }

  verDetalleViaje(aux: any) {
    this.router.navigate(['detalle-viajes', aux.uid]);
  }
}