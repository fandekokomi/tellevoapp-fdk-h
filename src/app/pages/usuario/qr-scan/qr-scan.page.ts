import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ModalController, Platform } from "@ionic/angular";
import { UsuarioService } from "src/app/services/usuario.service";
import { BarcodeScanner, LensFacing } from "@capacitor-mlkit/barcode-scanning";
import { SwalService } from "src/app/services/swal.service";
import { BarcodeScanningModalComponent } from "./barcode-scanning-modal.component";
import { ViajeService } from "src/app/services/viaje.service";
import { Viaje } from "src/app/interfaces/viaje";
import { NavigationService } from "src/app/services/navigation.service";
import { latLng } from 'leaflet';
import { Router } from "@angular/router";

@Component({
  selector: 'app-qr-scan',
  templateUrl: './qr-scan.page.html',
  styleUrls: ['./qr-scan.page.scss'],
})
export class QrScanPage implements OnInit {
  @ViewChild('videoContainer', { static: true }) videoContainer!: ElementRef;

  resultadoScan = '';

  constructor(private usuarioService: UsuarioService, private vs: ViajeService, private modalController: ModalController, private platform: Platform, private SwalService: SwalService, private ns: NavigationService, private router: Router) { }

  ngOnInit() {
    if (this.platform.is('capacitor')) {
      BarcodeScanner.isSupported().then();
      BarcodeScanner.checkPermissions().then();
      BarcodeScanner.removeAllListeners();
    }
  }

  async startScan() {
    const modal = await this.modalController.create({
    component: BarcodeScanningModalComponent,
    cssClass: 'barcode-scanning-modal',
    showBackdrop: false,
    componentProps: {
      formats: [],
      LensFacing: LensFacing.Back
    }
    });
  
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      const viaje = await this.vs.getViajePorUID(data.barcode.displayValue);

      if (viaje) {
        const user = await this.usuarioService.getCurrentUser();
        if (user) {

          if (viaje.estado === 'en espera') {
            if (viaje.personas.length < viaje.cantidadPersonas) {
              if (viaje.personas.includes(user.uid)) {
                this.SwalService.error('Ya estás ingresado en este viaje');
                return
              }
              viaje.personas.push(user.uid);
              const viajeEditado: Viaje = {
                uid: viaje.uid,
                vehiculoUID: viaje.vehiculoUID,
                origen: viaje.origen,
                destino: viaje.destino,
                origenCoords: { lat: viaje.origenCoords.lat, lng: viaje.origenCoords.lng},
                destinoCoords: { lat: viaje.destinoCoords.lat, lng: viaje.destinoCoords.lng},
                cantidadPersonas: viaje.cantidadPersonas,
                horaSalida: viaje.horaSalida,
                personas: viaje.personas,
                estado: viaje.estado
              }
  
              await this.vs.editViaje(viajeEditado);
              this.SwalService.success('Te has unido al viaje correctamente!').then(() => {
                this.ns.setNavigationData(latLng(viajeEditado.origenCoords.lat, viajeEditado.origenCoords.lng), latLng(viajeEditado.destinoCoords.lat, viajeEditado.destinoCoords.lng), viajeEditado.origen, viajeEditado.destino, viajeEditado.cantidadPersonas, viaje.uid);
                this.router.navigate(['/mapa'], {replaceUrl: true});
              });
            } else {
              this.SwalService.error('¡El viaje ya tiene la cantidad de personas máxima, no puede unirse a esté viaje!');
            }
          } else {
            this.SwalService.error(`Este viaje se encuentra ${viaje.estado} por lo que no puedes unirte`);
          }
        } else {
          this.SwalService.error('¡Su usuario no pudo ser verificado, reintentelo nuevamente!');
        }
      } else {
        this.SwalService.error('¡El QR escaneado no contiene un viaje válido!');
      }
    }
  
  }

}