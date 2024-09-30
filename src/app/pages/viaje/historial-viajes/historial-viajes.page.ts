import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ViajeService } from 'src/app/services/viaje.service';

@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {
  viajes: any[] = [];

  constructor(private router: Router, private viajeService: ViajeService) { }

  ngOnInit() {
    const usuarioLogin = JSON.parse(localStorage.getItem('usuarioLogin') || '{}');
    //this.viajes = this.viajeService.getViajes().filter(viaje => viaje.nombreUsuario === usuarioLogin.nombre);
  }

  verDetalleViaje(aux: any) {
    this.router.navigate(['detalle-viajes', aux.id]);
  }
}