import { LatLng } from "leaflet";

export interface Viaje {
    uid: string;
    vehiculoUID: string;
    origen: string;
    destino: string;
    origenCoords: LatLng | { lat: number; lng: number };
    destinoCoords: LatLng | { lat: number; lng: number };
    cantidadPersonas: number;
    horaSalida: Date;
    personas: string[],
    estado: string
}
