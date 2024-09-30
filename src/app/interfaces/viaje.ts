import * as lf from 'leaflet';

export interface Viaje {
    uid: string;
    choferuid: string;
    origen: string;
    destino: string;
    origenCoords: lf.LatLng;
    destinoCoords: lf.LatLng;
    cantidadPersonas: number;
}
