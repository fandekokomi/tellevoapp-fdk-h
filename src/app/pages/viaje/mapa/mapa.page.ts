import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import * as lf from 'leaflet';
import axios from 'axios';
import 'leaflet-routing-machine';
import { ViajeService } from 'src/app/services/viaje.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { BrowserMultiFormatReader, NotFoundException, Result } from '@zxing/library';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements AfterViewInit {
  map!: lf.Map;
  duoc = lf.latLng(-33.59848447497963, -70.57861620074077); //* Ubicación fija (Duoc UC Puente Alto)
  markerDestino!: lf.Marker;
  markerOrigen!: lf.Marker;
  searchVisible: boolean = false;
  originSuggestions: any[] = []; //* Lista de sugerencias para origen
  destinationSuggestions: any[] = []; //* Lista de sugerencias para destino
  routing: any; //* Para el control de rutas
  private mapboxtoken: string =
    'pk.eyJ1IjoiZHNvbSIsImEiOiJjbHp2cTNhOXEwNm0xMmpwdnBnaWllM3U4In0.m2dnTPdqC0gfRPLudOhWLg'; //!Token de mapbox
  private qrcodenumbers!: number;
  private originCoords!: lf.LatLng;
  private destinationCoords!: lf.LatLng;
  private origin!: string;
  private destination!: string;
  private cantidadPersonas!: number;
  private confirmarCantidad: boolean = false;
  image: string | undefined;
  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef;
  qrResult: string | undefined;
  private codeReader = new BrowserMultiFormatReader();

  constructor(private viajeService: ViajeService, private usuarioService: UsuarioService, private navigationService: NavigationService) {}

    async startScan() {
      try {
        const videoElement = this.videoContainer.nativeElement;
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        videoElement.srcObject = stream;
        videoElement.setAttribute('playsinline', 'true'); //* Necesario para iOS
        videoElement.play();

        //* Aplica la transformación para invertir la imagen horizontalmente
        //* Esto probablemente sólo sea necesario al utilizar la cámara del notebook, ya que estas inician el vídeo en modo espejo, mientras que los teléfonos no
        videoElement.style.transform = 'scaleX(-1)'; 
    
        let scanning = true; //* Variable para controlar el flujo de escaneo
    
        const stopScan = () => {
          scanning = false;  //* Detiene el escaneo
          videoElement.srcObject = null;  //* Detiene el stream de video
          stream.getTracks().forEach(track => track.stop());  //* Detiene el acceso a la cámara
        };
    
        this.codeReader.decodeFromVideoDevice(null, videoElement, (result, error) => {
          if (result && scanning) {
            this.qrResult = result.getText();
    
            //* Verifica automáticamente el QR
            if (parseInt(this.qrResult, 10) === this.qrcodenumbers) {
              alert('¡QR válido! Mostrando las indicaciones...');
              this.map.setView(this.originCoords, 15);
              this.calculateRoute(this.originCoords, this.destinationCoords, this.origin, this.destination);
              
              //* Oculta el contenedor del QR
              const qrContainer = document.getElementById('qr-container');
              if (qrContainer) {
                qrContainer.classList.add('hidden');
              }
    
              stopScan();  //* Detiene el escaneo cuando se encuentra un QR válido
            } else {
              alert('QR inválido. Intenta de nuevo.');
              //* No detenemos el escaneo si el QR no es válido
            }
          }
    
          if (error && !(error instanceof NotFoundException)) {
            console.error('Error al escanear', error);
          }
        });
      } catch (error) {
        console.error('Error al acceder a la cámara', error);
      }
    }
  

  ngOnInit(){
    this.generarMapa();
    this.initializeEvents();
  }

  ngAfterViewInit() {
    //* Retraso para asegurar que el mapa esté listo
    setTimeout(() => {  
      //* Recupera los datos de navegación
      const { originCoords, destinationCoords, origin, destination, cantidadPersonas } = this.navigationService.getNavigationData();

      if (this.map && originCoords && destinationCoords && origin && destination && cantidadPersonas) {
        this.map.setView(originCoords, 15);
        this.calculateRoute(originCoords, destinationCoords, origin, destination);
      }
    }, 1000);
  }

  generarMapa() {
    this.map = lf
      .map('mapa', { attributionControl: false, zoomControl: false })
      .setView([-33.59848447497963, -70.57861620074077], 15);

    lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.map
    );

    this.map.whenReady(() => {
      setTimeout(() => {
        this.map.invalidateSize(); //* ajuste de mapa
      }, 500);
    });
  }

  //* Método para inicializar los eventos de los botones
  initializeEvents() {
    const searchButton = document.getElementById('open-search');
    const closeButton = document.getElementById('btnCloseSearch');
    const searchButtonEl = document.getElementById(
      'searchButton'
    ) as HTMLButtonElement;
    const originInput = document.getElementById(
      'originInput'
    ) as HTMLInputElement;
    const destinationInput = document.getElementById(
      'destinationInput'
    ) as HTMLInputElement;

    //* Añade evento al botón de abrir búsqueda
    searchButton?.addEventListener('click', () => {
      this.btnBuscar();
    });

    //* Añade evento al botón de cerrar búsqueda
    closeButton?.addEventListener('click', () => {
      this.btnBuscar(); //* Cierra el cuadro de búsqueda
    });

    //* Añade evento al botón de buscar
    searchButtonEl?.addEventListener('click', async () => {
      await this.Busqueda(); //* Llama al método de búsqueda
    });

    //* Añade evento al campo de entrada para mostrar sugerencias para origen
    originInput?.addEventListener('input', async (event) => {
      const query = (event.target as HTMLInputElement).value;
      if (query) {
        this.originSuggestions = await this.autocompleteAddress(query);
        this.toggleSuggestions(true, 'origin');
      } else {
        this.toggleSuggestions(false, 'origin');
      }
    });

    //* Añade evento al campo de entrada para mostrar sugerencias para destino
    destinationInput?.addEventListener('input', async (event) => {
      const query = (event.target as HTMLInputElement).value;
      if (query) {
        this.destinationSuggestions = await this.autocompleteAddress(query);
        this.toggleSuggestions(true, 'destination');
      } else {
        this.toggleSuggestions(false, 'destination');
      }
    });
  }

  //* Método para manejar la visibilidad del cuadro de búsqueda y los botones
  btnBuscar() {
    const searchButton = document.getElementById('open-search');
    const searchContainer = document.getElementById('search-container');

    if (this.searchVisible) {
      //* Oculta el cuadro de búsqueda y muestra el botón de búsqueda
      if (searchContainer) {
        searchContainer.classList.remove('visible');
        searchContainer.classList.add('hidden');
      }
      if (searchButton) {
        searchButton.classList.remove('hidden');
        searchButton.classList.add('visible');
      }
    } else {
      //* Muestra el cuadro de búsqueda y oculta el botón de búsqueda
      if (searchButton) {
        searchButton.classList.remove('visible');
        searchButton.classList.add('hidden');
      }
      if (searchContainer) {
        searchContainer.classList.remove('hidden');
        searchContainer.classList.add('visible');
      }
    }

    //* Alterna la visibilidad
    this.searchVisible = !this.searchVisible;
  }

  //* Método para buscar la dirección ingresada
  async Busqueda() {
    //* Resetea la variable de confirmación y la cantidad de personas
    this.confirmarCantidad = false;
    this.cantidadPersonas = 0;

    const originInput = document.getElementById('originInput') as HTMLInputElement;
    const destinationInput = document.getElementById('destinationInput') as HTMLInputElement;
    const defaultAddress = "Duoc UC Sede Puente Alto";
  
    let origin = originInput.value.trim() || null;
    let destination = destinationInput.value.trim() || null;
  
    //* Geocodifica las direcciones
    let originCoords;
    let destinationCoords;
  
    //* Verifica que al menos una de las direcciones esté especificada
    if (!origin && !destination) {
      alert('Por favor, ingresa al menos una direcciÃ³n.');
      return;
    }
  
    //* Si solo se especifica una dirección, la otra se establece en la ubicación predeterminada de Duoc
    if (!origin) {
      origin = defaultAddress;
      originCoords = this.duoc;
    } else {
      originCoords = await this.geocodeAddress(origin);
    }
    if (!destination) {
      destination = defaultAddress;
      destinationCoords = this.duoc;
    } else {
      destinationCoords = await this.geocodeAddress(destination);
    }
  
    if (originCoords && destinationCoords) {
      this.originCoords = originCoords;
      this.destinationCoords = destinationCoords;
      this.origin = origin;
      this.destination = destination;
      this.btnBuscar(); //* Oculta el cuadro de búsqueda después de la búsqueda exitosa
  
      //* Muestra el contenedor y espera a que el usuario confirme la cantidad
      this.showCantidadPersonas();
  
      //* Espera hasta que se confirme la cantidad de personas
      while (!this.confirmarCantidad) {
        await new Promise(resolve => setTimeout(resolve, 100)); //* Espera breve para evitar bloqueo
      }
  
      //* Verifica la cantidad de personas después de que se haya confirmado
      if (this.cantidadPersonas > 0 && this.cantidadPersonas < 5 ) {
        this.showQRCode();
      } else {
        alert('Â¡La cantidad de personas debe ser entre 1 a 4!'); //TODO: Cambiar por sweetalert2
      }
    } else {
      alert('No se pudo encontrar la direcciÃ³n.'); //TODO: Cambiar por sweetalert2
    }
  }  

async showCantidadPersonas() {
  const cantidadPersonasContainer = document.getElementById('cantidadPersonas');
  if (cantidadPersonasContainer) {
    cantidadPersonasContainer.classList.remove('hidden');
  }
}

async updateCantidadPersonas(): Promise<void> {
  //* Selecciona el input por su ID
  const cantidadPersonasInput = document.getElementById('cantidadPersonasInput') as HTMLInputElement;

  //* Verifica si el elemento existe y obtiene su valor
  if (cantidadPersonasInput) {
    //* Convierte el valor a un número entero
    const cantidad = Math.floor(Number(cantidadPersonasInput.value));
  
    //* Si el valor no es un número válido o es negativo, asigna 0
    this.cantidadPersonas = isNaN(cantidad) || cantidad < 0 ? 0 : cantidad;
  } else {
    this.cantidadPersonas = 0;
  }
  
  this.confirmarCantidad = true; //* Marca que la cantidad ha sido confirmada
  cantidadPersonasInput.value = '';
  
  //* Oculta el contenedor de cantidad de personas
  const cantidadPersonasContainer = document.getElementById('cantidadPersonas');
  if (cantidadPersonasContainer) {
    cantidadPersonasContainer.classList.add('hidden');
  }  
}

async showQRCode() { //* Función para mostrar el código QR
  const qrContainer = document.getElementById('qr-container');
  const qrCode = document.getElementById('qr-code') as HTMLImageElement;

  if (qrContainer && qrCode) {
    //* Generar el código QR con la API pública
    this.qrcodenumbers = Math.floor(Math.random() * 90000) + 10000;
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(this.qrcodenumbers)}&size=150x150`;
    qrCode.src = qrCodeApiUrl;
    qrContainer.classList.remove('hidden'); //* Muestra el contenedor del código QR
    this.saveToHistory(this.originCoords, this.destinationCoords, this.origin, this.destination, this.cantidadPersonas);
  }
}

saveToHistory(originCoords: lf.LatLng, destinationCoords: lf.LatLng, originAddress: string, destinationAddress: string, cantidadPersonas: number) {
  const nuevoViaje = {
    uid: Date.now(),
    nombreUsuario: this.usuarioService.currentUser$.subscribe((usuario) => usuario!.nombre),
    origen: originAddress,
    destino: destinationAddress,
    origenCoords: originCoords,
    destinoCoords: destinationCoords,
    cantidadPersonas: cantidadPersonas,
  };
  //this.viajeService.addViaje(nuevoViaje);
}

confirmTravel() {
  const codigoInput = document.getElementById('codigoInput') as HTMLInputElement;
  const codigoStr= codigoInput.value || null;
  const codigo = codigoStr !== null ? parseInt(codigoStr, 10) : null;

  if (codigo === this.qrcodenumbers) {
    alert('Â¡Viaje confirmado! Ahora se mostrarÃ¡n las indicaciones.'); //TODO: Cambiar por sweetalert2
    //* Ocultar el QR y mostrar las indicaciones
    const qrContainer = document.getElementById('qr-container');
    if (qrContainer) {
      qrContainer.classList.add('hidden');
    }
    codigoInput.value = '';
    this.map.setView(this.originCoords, 15);
    this.calculateRoute(
      this.originCoords,
      this.destinationCoords,
      this.origin,
      this.destination
    );
  } else {
    alert('Â¡El cÃ³digo ingresado no es valido!'); //TODO: Cambiar por sweetalert2
  }
}

  calculateRoute(
    originCoords: lf.LatLng,
    destinationCoords: lf.LatLng,
    originAddress: string,
    destinationAddress: string
  ) {
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
        this.markerOrigen = lf
          .marker(originCoords, { draggable: false })
          .addTo(this.map);
        this.markerOrigen
          .bindPopup(`Origen: ${originAddress}`)
          .openPopup();
      }
  
      //* Actualiza el marcador de destino
      if (this.markerDestino) {
        this.markerDestino.setLatLng(destinationCoords);
        this.markerDestino.setPopupContent(`Destino: ${destinationAddress}`);
        this.markerDestino.openPopup();
      } else {
        //* Crea un nuevo marcador de destino si no existe
        this.markerDestino = lf
          .marker(destinationCoords, { draggable: false })
          .addTo(this.map);
        this.markerDestino
          .bindPopup(`Destino: ${destinationAddress}`)
          .openPopup();
      }
  
      //* Ajusta las instrucciones de Leaflet y el tamaño del mapa
      this.adjustLeafletControlContainer();
      this.map.invalidateSize();
  
    } else {
      //* Crea un nuevo control de enrutamiento si no existe
      this.routing = lf.Routing.control({
        waypoints: [originCoords, destinationCoords],
        fitSelectedRoutes: true,
        showAlternatives: true,
        collapsible: false,
        autoRoute: true,
        //* Opciones para la lí­nea principal (rojo)
        lineOptions: {
          styles: [{ color: 'red', opacity: 0.7, weight: 6 }],
        },
        //* Opciones para lí­neas alternativas (azul)
        altLineOptions: {
          styles: [{ color: 'blue', opacity: 0.7, weight: 6 }],
        },
        router: lf.Routing.mapbox(this.mapboxtoken, {
          profile: 'mapbox/driving',
          language: 'es',
        }),
        createMarker: (i: number, waypoint: lf.Routing.Waypoint) => {
          if (i === 0) {
            //* Crear el marker de origen
            if (this.markerOrigen) {
              this.markerOrigen.setLatLng(waypoint.latLng);
              return this.markerOrigen;
            } else {
              this.markerOrigen = lf
                .marker(waypoint.latLng, { draggable: false })
                .bindPopup(`Origen: ${originAddress}`);
              return this.markerOrigen.addTo(this.map);
            }
          } else {
            //* Crear el marker de destino
            if (this.markerDestino) {
              this.markerDestino.setLatLng(waypoint.latLng);
              return this.markerDestino;
            } else {
              this.markerDestino = lf
                .marker(waypoint.latLng, { draggable: false })
                .bindPopup(`Destino: ${destinationAddress}`);
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

  //* Método para geocodificar la dirección utilizando Mapbox
  async geocodeAddress(address: string): Promise<lf.LatLng | null> {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${this.mapboxtoken}`
      );
      const { features } = response.data;
      if (features && features.length > 0) {
        const [lng, lat] = features[0].center;
        return lf.latLng(lat, lng);
      }
    } catch (error) {
      console.error('Error al geocodificar la dirección:', error);
    }
    return null;
  }

  //* Método para obtener sugerencias de autocompletado utilizando Mapbox
  async autocompleteAddress(query: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        { params: { access_token: this.mapboxtoken, limit: 3 } }
      );
      return response.data.features.map((feature: any) => ({
        display_name: feature.place_name,
        lat: feature.center[1],
        lon: feature.center[0],
      }));
    } catch (error) {
      console.error('Error en el autocompletado:', error);
      return [];
    }
  }

  selectSuggestion(suggestion: any, type: string) {
    if (type === 'origin') {
      const originInput = document.getElementById('originInput') as HTMLInputElement;
      originInput.value = suggestion.display_name;
      this.originSuggestions = [];
    } else if (type === 'destination') {
      const destinationInput = document.getElementById('destinationInput') as HTMLInputElement;
      destinationInput.value = suggestion.display_name;
      this.destinationSuggestions = [];
    }
    this.toggleSuggestions(false, type); //* Oculta las sugerencias después de la selección
  }

  //* Método que oculta o muestra el cuadro de sugerencias
  toggleSuggestions(visible: boolean, type: string) {
    const suggestionsContainerId = type === 'origin' ? 'autocomplete-suggestions-origin' : 'autocomplete-suggestions-destination';
    const suggestionsContainer = document.getElementById(suggestionsContainerId);

    if (suggestionsContainer) {
      if (visible) {
        suggestionsContainer.classList.remove('hidden');
        suggestionsContainer.classList.add('visible');
      } else {
        suggestionsContainer.classList.remove('visible');
        suggestionsContainer.classList.add('hidden');
      }
    }
  }
}
