import { Injectable } from '@angular/core';
import * as lf from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private originCoords!: lf.LatLng;
  private destinationCoords!: lf.LatLng;
  private origin!: string;
  private destination!: string;
  private cantidadPersonas!: number;
  private viajeUID!: string;

  setNavigationData(originCoords: lf.LatLng, destinationCoords: lf.LatLng, origin: string, destination: string, cantidadPersonas: number, viajeUID: string) {
    this.originCoords = originCoords;
    this.destinationCoords = destinationCoords;
    this.origin = origin;
    this.destination = destination;
    this.cantidadPersonas = cantidadPersonas;
    this.viajeUID = viajeUID;
  }

  getNavigationData() {
    return {
      originCoords: this.originCoords,
      destinationCoords: this.destinationCoords,
      origin: this.origin,
      destination: this.destination,
      cantidadPersonas: this.cantidadPersonas,
      viajeUID: this.viajeUID
    };
  }
}