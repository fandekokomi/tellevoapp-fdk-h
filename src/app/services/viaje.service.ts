import { Injectable } from '@angular/core';
import { Viaje } from '../interfaces/viaje';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {

  constructor(private firestore: AngularFirestore) { }

  async getViajes(): Promise<Viaje[]> {
    const viajesSnapshot = await firstValueFrom(this.firestore.collection('viajes').get());
    const viajes = viajesSnapshot.docs.map(doc =>{
      const data = doc.data() as Viaje;
      return {
        uid: data.uid,
        choferuid: data.choferuid,
        origen: data.origen,
        destino: data.destino,
        origenCoords: data.origenCoords,
        destinoCoords: data.destinoCoords,
        cantidadPersonas: data.cantidadPersonas,
      } as Viaje;
    });
    return viajes;
  }

  async addViaje(viaje: Viaje): Promise<void>{
    await this.firestore.collection('viajes').doc(viaje.uid).set(viaje);
  }

  async deleteViaje(uid: string): Promise<boolean> {
    try {
      const actions = await firstValueFrom(
        this.firestore.collection('viajes', ref => ref.where('uid', '==', uid)).snapshotChanges()
      );
      if (actions.length > 0) {
        //* Eliminamos la data del viaje.
        await this.firestore.collection('viajes').doc(uid).delete();
        //* devolvemos true si funciono.
        return true;
      } else {
        console.log('Viaje no encontrado');
        return false;
      }
    } catch (error) {
      console.log('Error eliminando el viaje: ', error);
      return false;
    }
  }
}
