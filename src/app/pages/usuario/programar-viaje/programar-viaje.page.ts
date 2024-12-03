import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { latLng, LatLng } from 'leaflet';
import axios from 'axios';
import { UsuarioService } from 'src/app/services/usuario.service';
import { VehiculoService } from 'src/app/services/vehiculo.service';
import { SwalService } from 'src/app/services/swal.service';
import { Vehiculo } from 'src/app/interfaces/vehiculo';
import { ViajeService } from 'src/app/services/viaje.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Viaje } from 'src/app/interfaces/viaje';
import { NavigationService } from 'src/app/services/navigation.service';
import { Router } from '@angular/router';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-programar-viaje',
  templateUrl: './programar-viaje.page.html',
  styleUrls: ['./programar-viaje.page.scss'],
})
export class ProgramarViajePage implements OnInit {
  valorQR: string = '';
  viajeForm: FormGroup;
  currentDate: string;
  vehiculos: Vehiculo[] = [];
  origenSuggestions: any[] = [];
  destinationSuggestions: any[] = [];
  duoc = latLng(-33.59848447497963, -70.57861620074077); //* Ubicación fija (Duoc UC Puente Alto)
  private mapboxtoken: string = 'pk.eyJ1IjoiZHNvbSIsImEiOiJjbHp2cTNhOXEwNm0xMmpwdnBnaWllM3U4In0.m2dnTPdqC0gfRPLudOhWLg'; //!Token de mapbox
  viajeUID!: string;

  constructor(
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private vehiculoService: VehiculoService,
    private SwalService: SwalService,
    private viajeService: ViajeService,
    private firestore: AngularFirestore,
    private navigationService: NavigationService,
    private router: Router,
    private platform: Platform
  ) {

    this.currentDate = new Date().toISOString();

    this.viajeForm = this.formBuilder.group({
      vehiculo: ['', Validators.required],
      origen: ['',],
      destino: ['',],
      cantidadPersonas: [1, [Validators.required, Validators.min(1), Validators.max(4)]],
      horaSalida: [this.currentDate, [Validators.required, this.notInThePastValidator()]]
    });
  }  

  async ngOnInit() {
    this.usuarioService.currentUser$.subscribe(async (user) => {
      if (user) {
        this.vehiculos = await this.vehiculoService.getVehiculosByUsuarioUID(user.uid);
      }
    });
    this.loadEvents();
  }

  //* Captura el elemento HTML, lo convierte a canvas y guarda la imágen
  captureScreen(){
    const element = document.getElementById('qrImg') as HTMLElement;
    html2canvas(element).then((canvas: HTMLCanvasElement) => {

      if (this.platform.is('capacitor')) {
        this.shareImage(canvas);
      } else {
        this.downloadImage(canvas);
      }

    })
  }
  //* Guardar imágen en web
  downloadImage(canvas: HTMLCanvasElement){
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = 'qr.png';
    link.click();
  }
 //* Compartir imágen en móvil
  async shareImage(canvas: HTMLCanvasElement){
    this.SwalService.loading('Compartiendo imágen QR');
    let base64 = canvas.toDataURL();
    let path = 'qr.png';

    await Filesystem.writeFile({
      path,
      data: base64,
      directory: Directory.Cache
    }).then(async (res) => {
      let uri = res.uri;

      await Share.share({url: uri});
      await Filesystem.deleteFile({
        path,
        directory: Directory.Cache
      });
    }).finally(() => {
      this.SwalService.cerrar();
    });

   
  }

  //* Validador personalizado para comprobar si la hora no está en el pasado
  private notInThePastValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedTime = new Date(control.value);
      const now = new Date();

      //* Establece parte de la hora actual para que coincida con el formato de hora seleccionado
      now.setSeconds(0);
      now.setMilliseconds(0);
      
      return selectedTime < now ? { 'timeInPast': true } : null;
    };
  }

  loadEvents(){
    const origenInput = document.getElementById(
      'origenInput'
    ) as HTMLInputElement;
    const destinationInput = document.getElementById(
      'destinationInput'
    ) as HTMLInputElement;

    //* Añadir evento para el campo de origen
    origenInput.addEventListener('input', async (event) => {
      const query = (event.target as HTMLInputElement).value;
      if (query) {
        this.origenSuggestions = await this.autocompleteAddress(query);
        this.toggleSuggestions(true, 'origen');
      } else {
        this.toggleSuggestions(false, 'origen');
      }
    });

    //* Añadir evento para el campo de destino
    destinationInput.addEventListener('input', async (event) => {
      console.log('evento destinatioInput')
      const query = (event.target as HTMLInputElement).value;
      if (query) {
        this.destinationSuggestions = await this.autocompleteAddress(query);
        this.toggleSuggestions(true, 'destination');
      } else {
        this.toggleSuggestions(false, 'destination');
      }
    });
  }

  //* Método para geocodificar la dirección utilizando Mapbox
  async geocodeAddress(address: string): Promise<LatLng | null> {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${this.mapboxtoken}`
      );
      const { features } = response.data;
      if (features && features.length > 0) {
        const [lng, lat] = features[0].center;
        return latLng(lat, lng);
      }
    } catch (error) {
      console.error('Error al geocodificar la dirección:', error);
    }
    return null;
  }

  //* Función para autocompletar direcciones
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

  //* Alternar visibilidad de las sugerencias
  toggleSuggestions(show: boolean, type: string) {
    console.log(`Tipo: ${type} para ${show}`)
    const suggestionDiv = document.getElementById(`autocomplete-suggestions-${type}`);
    if (suggestionDiv) {
      if (show) {
        suggestionDiv.classList.remove('hidden');
      } else {
        suggestionDiv.classList.add('hidden');
      }
    }
  }

  //* Seleccionar una sugerencia de la lista
  selectSuggestion(suggestion: any, type: string) {
    if (type === 'origen') {
      this.viajeForm.get('origen')?.setValue(suggestion.display_name);
      this.origenSuggestions = [];
      this.toggleSuggestions(false, 'origen');
    } else if (type === 'destination') {
      console.log(`Tipo: ${type} para seleccionar sugerencias`)
      this.viajeForm.get('destino')?.setValue(suggestion.display_name);
      this.destinationSuggestions = [];
      this.toggleSuggestions(false, 'destination');
    }
  }

  clearSearch() {
    this.viajeForm.get('origen')?.reset();
    this.viajeForm.get('destino')?.reset();
    this.toggleSuggestions(false, 'origen');
    this.toggleSuggestions(false, 'destination');
  }

  //* Convierte las coordenadas a un formato plano
  convertLatLngToPlain(latLng: LatLng) {
    return {
      lat: latLng.lat,
      lng: latLng.lng,
    };
  }

  async iniciarViaje() {
    try {
      const viaje = await this.viajeService.getViajePorUID(this.viajeUID)
    console.log(viaje);
    console.log(viaje!.estado);
    viaje!.estado = 'iniciado';
    console.log(viaje!.estado);
    const editViaje: Viaje = {
      ...viaje!,
      origenCoords: this.convertLatLngToPlain(latLng(viaje!.origenCoords.lat, viaje!.origenCoords.lng)),
      destinoCoords: this.convertLatLngToPlain(latLng(viaje!.destinoCoords.lat, viaje!.destinoCoords.lng))
    }
    console.log(editViaje);
    await this.viajeService.editViaje(editViaje);
    console.log('ya cambio el viaje');
    this.SwalService.clearLoading2(); //* Cerrar el loading2
    console.log('se cerro el loading2');
    const origen = this.viajeForm.get('origen')!.value || 'Duoc UC Sede Puente Alto';
    const destino = this.viajeForm.get('destino')!.value || 'Duoc UC Sede Puente Alto';
    console.log(origen);
    console.log(destino);
    const origenCoords = origen === 'Duoc UC Sede Puente Alto' ? this.duoc : await this.geocodeAddress(origen);
    const destinoCoords = destino === 'Duoc UC Sede Puente Alto' ? this.duoc : await this.geocodeAddress(destino);
    console.log(origenCoords);
    console.log(destinoCoords);
    try {
      this.navigationService.setNavigationData(
        origenCoords!, destinoCoords!, origen, destino, this.viajeForm.get('cantidadPersonas')!.value, viaje!.uid
      );
      
      this.router.navigate(['/mapa'], {replaceUrl: true});
      this.SwalService.success('Iniciando viaje...');
    } catch (error) {
      console.error('Error al iniciar el viaje:', error);
      this.SwalService.error('No se pudo iniciar el viaje, reinténtelo nuevamente.');
    }
    } catch (error) {
      console.log(error);
    }
  }  

  async programarViaje() {
    //* Validar si el formulario es válido antes de proceder
    if (!this.viajeForm.valid) {
      this.SwalService.error('Por favor complete todos los campos requeridos antes de programar el viaje.');
      return;
    }
  
    const defaultAddress = 'Duoc UC Sede Puente Alto';
    let vehiculoUID = this.viajeForm.get('vehiculo')!.value;
    let origen = this.viajeForm.get('origen')!.value;
    let destino = this.viajeForm.get('destino')!.value;
    let origenCoords;
    let destinoCoords;
  
    if (!origen && !destino) {
      this.SwalService.error('Debe ingresar al menos una dirección.');
      return;
    }
  
    origen = origen || defaultAddress;
    origenCoords = origen === defaultAddress ? this.duoc : await this.geocodeAddress(origen);
    
    destino = destino || defaultAddress;
    destinoCoords = destino === defaultAddress ? this.duoc : await this.geocodeAddress(destino);
  
    try {
      const nuevoViaje = {
        uid: this.firestore.createId(),
        vehiculoUID: vehiculoUID,
        origen: origen,
        destino: destino,
        origenCoords: this.convertLatLngToPlain(origenCoords!),
        destinoCoords: this.convertLatLngToPlain(destinoCoords!),
        cantidadPersonas: this.viajeForm.get('cantidadPersonas')!.value,
        horaSalida: new Date(this.viajeForm.get('horaSalida')?.value),
        personas: [],
        estado: 'en espera'
      } as Viaje;
  
      await this.viajeService.addViaje(nuevoViaje);
      this.viajeUID = nuevoViaje.uid;
      await this.SwalService.success('El viaje ha sido programado exitosamente.');
  
      this.valorQR = nuevoViaje.uid;
      this.toggleQR(true);
  
      //* Mostrar loading mientras se esperan personas
      this.SwalService.loading2('Esperando personas...');
  
      //* Subscribirse a los cambios en el viaje
      this.viajeService.getViajeObservablePorUID(nuevoViaje.uid).subscribe((viaje) => {
        if (viaje && viaje.personas.length === viaje.cantidadPersonas) {
          viaje.estado = 'iniciado'
          this.viajeService.editViaje(viaje);
          //* Redirigir al mapa cuando se cumpla la condición
          this.navigationService.setNavigationData(
            origenCoords!, destinoCoords!, origen, destino, this.viajeForm.get('cantidadPersonas')!.value, viaje.uid
          );
          this.router.navigate(['/mapa'], {replaceUrl: true});
          this.SwalService.clearLoading2(); //* Cerrar el loading2
        }
      });
  
    } catch (error) {
      console.error('Error al programar el viaje:', error);
      this.SwalService.error('No se pudo programar el viaje, reinténtelo nuevamente.');
    }
  }  

  cerrarQR(){
    this.toggleQR(false)
  }

  //* Alternar visibilidad del QR
  toggleQR(show: boolean) {
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
      if (show) {
        qrContainer.classList.remove('hidden');
      } else {
        qrContainer.classList.add('hidden');
      }
    }
  }
}