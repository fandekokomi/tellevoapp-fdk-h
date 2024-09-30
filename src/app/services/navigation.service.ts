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

  setNavigationData(originCoords: lf.LatLng, destinationCoords: lf.LatLng, origin: string, destination: string, cantidadPersonas: number) {
    this.originCoords = originCoords;
    this.destinationCoords = destinationCoords;
    this.origin = origin;
    this.destination = destination;
    this.cantidadPersonas = cantidadPersonas;
  }

  getNavigationData() {
    return {
      originCoords: this.originCoords,
      destinationCoords: this.destinationCoords,
      origin: this.origin,
      destination: this.destination,
      cantidadPersonas: this.cantidadPersonas
    };
  }
}