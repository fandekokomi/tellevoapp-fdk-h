import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalle-choferes',
  templateUrl: './detalle-choferes.page.html',
  styleUrls: ['./detalle-choferes.page.scss'],
})
export class DetalleChoferesPage implements OnInit {

  //* Lista de viajes que toma la estructura definida por la Interface de Viaje
  choferes = [
    {
      nombreChofer: 'Juan Pérez',
      puntuacionChofer: '4.8',
      precioViaje: '$12.000',
      modeloAuto: 'Hyundai Tucson',
      patenteAuto: 'EF 456 GH',
      destino: 'Plaza de Armas 100, Santiago',
      imagenChofer: 'assets/choferes/chofer1.jpeg'
    },
    {
      nombreChofer: 'Ana Gómez',
      puntuacionChofer: '4.5',
      precioViaje: '$9.000',
      modeloAuto: 'Toyota Corolla',
      patenteAuto: 'IJ 789 KL',
      destino: 'Parque Bicentenario, Santiago',
      imagenChofer: 'assets/choferes/chofer2.jpg' 
    },
    {
      nombreChofer: 'Carlos Silva',
      puntuacionChofer: '4.9',
      precioViaje: '$10.500',
      modeloAuto: 'Ford Fiesta',
      patenteAuto: 'MN 012 OP',
      destino: 'Centro Cultural La Moneda, Santiago',
      imagenChofer: 'assets/choferes/chofer3.jpg'  
    },
    {
      nombreChofer: 'Laura Martínez',
      puntuacionChofer: '4.7',
      precioViaje: '$11.200',
      modeloAuto: 'Nissan X-Trail',
      patenteAuto: 'QR 345 ST',
      destino: 'Museo Nacional de Bellas Artes, Santiago',
      imagenChofer: 'assets/choferes/chofer4.jpg'  
    },
    {
      nombreChofer: 'Miguel Fernández',
      puntuacionChofer: '4.6',
      precioViaje: '$8.800',
      modeloAuto: 'Kia Seltos',
      patenteAuto: 'UV 678 WX',
      destino: 'Costanera Center, Santiago',
      imagenChofer: 'assets/choferes/chofer5.jpg'  
    },
    {
      nombreChofer: 'Paola Ruiz',
      puntuacionChofer: '5.0',
      precioViaje: '$13.000',
      modeloAuto: 'Volkswagen Tiguan',
      patenteAuto: 'YZ 901 AB',
      destino: 'Estadio Nacional, Santiago',
      imagenChofer: 'assets/choferes/chofer6.jpg'  
    }
  ];

  //* Recibe el nombre del viaje que viene del param
  nombreChofer?: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    //console.log(this.activateRoute.snapshot.paramMap.get('nombre'));
    this.nombreChofer = this.activatedRoute.snapshot.paramMap.get('nombreChofer') || '';
  
    this.filtrarViajes();
  }  

  filtrarViajes() {
    this.choferes = this.choferes.filter(aux => aux.nombreChofer === this.nombreChofer);
  }

  verDetalleChofer(aux:any) {
    this.router.navigate(['detalle-chofer', aux.nombreChofer]);
  }

}
