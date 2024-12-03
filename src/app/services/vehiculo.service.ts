import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vehiculo } from '../interfaces/vehiculo';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  constructor(private firestore: AngularFirestore) {
  }

  //* Agregar un vehículo a Firestore usando su UID
  async addVehiculo(vehiculo: Vehiculo): Promise<void> {
    await this.firestore.collection('vehiculos').doc(vehiculo.uid).set(vehiculo); //* Guarda el vehículo con su UID
  }

  //* Obtener vehículos por UID de usuario
  async getVehiculosByUsuarioUID(usuarioUID: string): Promise<Vehiculo[]> {
    const vehiculosSnapshot = await firstValueFrom(
      this.firestore.collection<Vehiculo>('vehiculos', ref => ref.where('usuarioUID', '==', usuarioUID)).get()
    );
    return vehiculosSnapshot.docs.map(doc => ({
      ...doc.data()
    })) as Vehiculo[];
  }

  //* Actualizar un vehículo en Firestore
  async updateVehiculo(uid: string, updatedVehiculo: Partial<Vehiculo>): Promise<void> {
    await this.firestore.collection('vehiculos').doc(uid).update(updatedVehiculo);
  }

  //* Eliminar un vehículo en Firestore
  async deleteVehiculo(uid: string): Promise<Boolean> {
    try {
      await this.firestore.collection('vehiculos').doc(uid).delete();
      return true
    } catch (error) {
      return false
    }
  }

  //* Eliminar el vehículo de un usuario por su UID
  async deleteVehiculoByUsuarioUID(usuarioUID: string): Promise<void> {
    try {
      //* Obtener el vehículo asociado al usuarioUID
      const vehiculoSnapshot = await firstValueFrom(
        this.firestore.collection<Vehiculo>('vehiculos', ref => ref.where('usuarioUID', '==', usuarioUID)).get()
      );

      //* Verificar si se encontró un vehículo
      if (vehiculoSnapshot) {
        //* Eliminar el primer (y único) documento encontrado
        const vehiculoDoc = vehiculoSnapshot.docs[0];
        await this.firestore.collection('vehiculos').doc((vehiculoDoc.data() as Vehiculo).uid).delete();
      }
    } catch (error: any) {
      throw new Error('Error al eliminar el vehículo: ' + error.message);
    }
  }
}
