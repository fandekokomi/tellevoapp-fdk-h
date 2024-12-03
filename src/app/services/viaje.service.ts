import { Injectable } from '@angular/core';
import { Viaje } from '../interfaces/viaje';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom, map, Observable } from 'rxjs';
import { latLng } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class ViajeService {
  constructor(private firestore: AngularFirestore) {}

  async getViajes(): Promise<Viaje[]> {
    const viajesSnapshot = await firstValueFrom(
      this.firestore.collection('viajes').get()
    );
    const viajes = viajesSnapshot.docs.map((doc) => {
      const data = doc.data() as Viaje;
      return {
        uid: data.uid,
        vehiculoUID: data.vehiculoUID,
        origen: data.origen,
        destino: data.destino,
        origenCoords: latLng(data.origenCoords.lat, data.origenCoords.lng),
        destinoCoords: latLng(data.destinoCoords.lat, data.destinoCoords.lng),
        cantidadPersonas: data.cantidadPersonas,
        horaSalida: data.horaSalida,
        personas: data.personas,
        estado: data.estado
      } as Viaje;
    });
    return viajes;
  }

  async getViajePorUID(uid: string): Promise<Viaje | undefined> {
    const viajes = await firstValueFrom(
      this.firestore
        .collection<Viaje>('viajes', (ref) => ref.where('uid', '==', uid))
        .valueChanges()
    );

    return viajes.length > 0
      ? ({
          uid: viajes[0].uid,
          vehiculoUID: viajes[0].vehiculoUID,
          origen: viajes[0].origen,
          destino: viajes[0].destino,
          origenCoords: latLng(
            viajes[0].origenCoords.lat,
            viajes[0].origenCoords.lng
          ),
          destinoCoords: latLng(
            viajes[0].destinoCoords.lat,
            viajes[0].destinoCoords.lng
          ),
          cantidadPersonas: viajes[0].cantidadPersonas,
          horaSalida: viajes[0].horaSalida,
          personas: viajes[0].personas,
          estado: viajes[0].estado
        } as Viaje)
      : undefined;
  }

  getViajeObservablePorUID(uid: string): Observable<Viaje | undefined> {
    return this.firestore
      .collection<Viaje>('viajes', (ref) => ref.where('uid', '==', uid))
      .valueChanges()
      .pipe(
        map((viajes) => {
          if (viajes.length > 0) {
            return {
              uid: viajes[0].uid,
              vehiculoUID: viajes[0].vehiculoUID,
              origen: viajes[0].origen,
              destino: viajes[0].destino,
              origenCoords: latLng(
                viajes[0].origenCoords.lat,
                viajes[0].origenCoords.lng
              ),
              destinoCoords: latLng(
                viajes[0].destinoCoords.lat,
                viajes[0].destinoCoords.lng
              ),
              cantidadPersonas: viajes[0].cantidadPersonas,
              horaSalida: viajes[0].horaSalida,
              personas: viajes[0].personas,
              estado: viajes[0].estado
            } as Viaje;
          } else {
            return undefined;
          }
        })
      );
  }

  async addViaje(viaje: Viaje): Promise<void> {
    await this.firestore.collection('viajes').doc(viaje.uid).set(viaje);
  }

  async editViaje(viaje: Viaje): Promise<void> {
    await this.firestore.collection('viajes').doc(viaje.uid).set(viaje);
  }

  async updateViaje(uid: string, viajeActualizado: Viaje): Promise<boolean> {
    try {
      await this.firestore.collection('viajes').doc(uid).update(viajeActualizado);
      console.log('Viaje actualizado correctamente');
      return true; //* Devuelve true si se actualiza correctamente
    } catch (error) {
      console.error('Error al actualizar el viaje:', error);
      return false; //* Devuelve false si hay un error
    }
  }

  async deleteViaje(uid: string): Promise<boolean> {
    try {
      const actions = await firstValueFrom(
        this.firestore
          .collection('viajes', (ref) => ref.where('uid', '==', uid))
          .snapshotChanges()
      );
      if (actions.length > 0) {
        //* Eliminamos la data del viaje.
        await this.firestore.collection('viajes').doc(uid).delete();
        //* devolvemos true si funciono.
        return true;
      } else {
        throw new Error('Viaje no encontrado');
      }
    } catch (error) {
      throw error;
    }
  }
}
