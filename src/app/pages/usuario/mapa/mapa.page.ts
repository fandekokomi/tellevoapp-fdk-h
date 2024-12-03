import { Component, AfterViewInit} from '@angular/core';
import {
  Map,
  Marker,
  LatLng,
  map,
  tileLayer,
  marker,
  Routing,
  latLng,
  icon
} from 'leaflet';
import 'leaflet-routing-machine';
import { NavigationService } from 'src/app/services/navigation.service';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ViajeService } from 'src/app/services/viaje.service';
import { Viaje } from 'src/app/interfaces/viaje';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements AfterViewInit {
  viajeUID!: string;
  tipoUsuario!: string;
  map!: Map;
  duoc = latLng(-33.59848447497963, -70.57861620074077); //* Ubicación fija (Duoc UC Puente Alto)
  markerDestino!: Marker;
  markerOrigen!: Marker;
  routing: any; //* Para el control de rutas
  private mapboxtoken: string =
    'pk.eyJ1IjoiZHNvbSIsImEiOiJjbHp2cTNhOXEwNm0xMmpwdnBnaWllM3U4In0.m2dnTPdqC0gfRPLudOhWLg'; //!Token de mapbox

  constructor(
    private navigationService: NavigationService,
    private usuarioService: UsuarioService,
    private vs: ViajeService,
    private sw: SwalService,
    private router: Router
  ) {
    this.usuarioService.currentUser$.subscribe((user) => {
      this.tipoUsuario = user!.tipo;
    });

    setTimeout(() => {
      const { originCoords, destinationCoords, origin, destination, cantidadPersonas, viajeUID } = this.navigationService.getNavigationData();
    
      if (this.map && originCoords && destinationCoords && origin && destination && cantidadPersonas && viajeUID) {
        this.map.setView(originCoords, 15);
        this.viajeUID = viajeUID;
        this.calculateRoute(originCoords, destinationCoords, origin, destination);
    
        this.vs.getViajeObservablePorUID(this.viajeUID).subscribe((viaje) => {
          if (viaje && viaje.estado === 'finalizado') {
            this.sw.info('El viaje fue finalizado!');
            this.router.navigate(['/home'], { replaceUrl: true });
          }
        });
      } else {
        console.error("Error: Datos de navegación incompletos.");
      }
    }, 1000);    
  }

  ngOnInit() {
    this.generarMapa();
  }

  async finalizarViaje() {
    if (!this.viajeUID) {
      console.error("Error: viajeUID no está definido en finalizarViaje.");
      return;
    }
  
    const viaje = await this.vs.getViajePorUID(this.viajeUID);
    if (viaje) {
      const viajeEditado: Viaje = {
        ...viaje,
        origenCoords: { lat: viaje.origenCoords.lat, lng: viaje.origenCoords.lng },
        destinoCoords: { lat: viaje.destinoCoords.lat, lng: viaje.destinoCoords.lng },
        estado: 'finalizado'
      };
      this.vs.editViaje(viajeEditado);
    } else {
      console.error("Error: No se encontró un viaje con el UID proporcionado.");
    }
  }
  

  ngAfterViewInit() {
    //* Retraso para asegurar que el mapa esté listo
  }

  generarMapa() {
    this.map = map('mapa', {
      attributionControl: false,
      zoomControl: false,
    }).setView([-33.59848447497963, -70.57861620074077], 15);

    tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.whenReady(() => {
      setTimeout(() => {
        this.map.invalidateSize(); //* ajuste de mapa
      }, 500);
    });
  }

  calculateRoute(
    originCoords: LatLng,
    destinationCoords: LatLng,
    originAddress: string,
    destinationAddress: string
  ) {
    //* Crea un nuevo icono a partir de tu archivo SVG
    const customIcon = icon({
      iconUrl: 'assets/marker.svg', //* Ruta del icono del marker
      iconSize: [25, 41], //* Tamaño del icono
      iconAnchor: [12, 41], //* El punto del icono que corresponde a la ubicación del marcador
      popupAnchor: [1, -34], //* El punto desde el que se abre el popup respecto al icono
    });
  
    //* Verifica si ya existe un control de enrutamiento
    if (this.routing) {
      //* Actualiza los puntos de la ruta
      this.routing.setWaypoints([originCoords, destinationCoords]);
  
      //* Actualiza el marcador de origen
      if (this.markerOrigen) {
        this.markerOrigen.setLatLng(originCoords);
        this.markerOrigen.setPopupContent(`Origen: ${originAddress}`);
        this.markerOrigen.openPopup();
      } else {
        //* Crea un nuevo marcador de origen si no existe
        this.markerOrigen = marker(originCoords, { icon: customIcon, draggable: false }).addTo(this.map);
        this.markerOrigen.bindPopup(`Origen: ${originAddress}`).openPopup();
      }
  
      //* Actualiza el marcador de destino
      if (this.markerDestino) {
        this.markerDestino.setLatLng(destinationCoords);
        this.markerDestino.setPopupContent(`Destino: ${destinationAddress}`);
        this.markerDestino.openPopup();
      } else {
        //* Crea un nuevo marcador de destino si no existe
        this.markerDestino = marker(destinationCoords, { icon: customIcon, draggable: false }).addTo(this.map);
        this.markerDestino.bindPopup(`Destino: ${destinationAddress}`).openPopup();
      }
  
      //* Ajusta las instrucciones de Leaflet y el tamaño del mapa
      this.adjustLeafletControlContainer();
      this.map.invalidateSize();
    } else {
      //* Crea un nuevo control de enrutamiento si no existe
      this.routing = Routing.control({
        waypoints: [originCoords, destinationCoords],
        fitSelectedRoutes: true,
        showAlternatives: true,
        collapsible: false,
        autoRoute: true,
        //* Opciones para la línea principal (rojo)
        lineOptions: {
          styles: [{ color: 'red', opacity: 0.7, weight: 6 }],
        },
        //* Opciones para líneas alternativas (azul)
        altLineOptions: {
          styles: [{ color: 'blue', opacity: 0.7, weight: 6 }],
        },
        router: Routing.mapbox(this.mapboxtoken, {
          profile: 'mapbox/driving',
          language: 'es',
        }),
        createMarker: (i: number, waypoint: Routing.Waypoint) => {
          if (i === 0) {
            //* Crear el marker de origen
            if (this.markerOrigen) {
              this.markerOrigen.setLatLng(waypoint.latLng);
              return this.markerOrigen;
            } else {
              this.markerOrigen = marker(waypoint.latLng, {
                icon: customIcon, //* Asigna el icono personalizado
                draggable: false,
              }).bindPopup(`Origen: ${originAddress}`);
              return this.markerOrigen.addTo(this.map);
            }
          } else {
            //* Crear el marker de destino
            if (this.markerDestino) {
              this.markerDestino.setLatLng(waypoint.latLng);
              return this.markerDestino;
            } else {
              this.markerDestino = marker(waypoint.latLng, {
                icon: customIcon, //* Asigna el icono personalizado
                draggable: false,
              }).bindPopup(`Destino: ${destinationAddress}`);
              return this.markerDestino.addTo(this.map);
            }
          }
        },
      }).addTo(this.map);
  
      //* Ajusta las instrucciones de Leaflet y el tamaño del mapa
      this.adjustLeafletControlContainer();
      this.map.invalidateSize();
    }
  }  

  //! CÓDIGO IMPORTANTE PARA AJUSTAR EL CUADRO DE INSTRUCCIONES POR DEBAJO DEL MAPA, ¡NO MODIFICAR!.
  adjustLeafletControlContainer() {
    const controlContainer = document.querySelector(
      '.leaflet-control-container'
    ) as HTMLElement;
    const routingContainer = document.querySelector(
      '.leaflet-routing-container'
    ) as HTMLElement;
    if (controlContainer) {
      controlContainer.style.overflowY = 'auto';
      controlContainer.style.height = '50%'; //* Ajusta el contenedor a la mitad del mapa
      controlContainer.style.position = 'absolute';
      controlContainer.style.bottom = '0';
      controlContainer.style.width = '100%';
      controlContainer.style.backgroundColor = 'white';
      controlContainer.style.color = 'black';
      controlContainer.style.zIndex = '1000'; //* Para asegurar que quede sobre el mapa
      controlContainer.style.margin = '0'; //
      controlContainer.style.padding = '5'; //
      controlContainer.style.display = 'flex'; //
      controlContainer.style.justifyContent = 'center'; //
      controlContainer.style.borderRadius = '0'; //
      if (routingContainer) {
        routingContainer.style.margin = '10px'; //
      }
    }
  }
}