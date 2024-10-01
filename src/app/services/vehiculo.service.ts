import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Vehiculo } from '../interfaces/vehiculo';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  private vehiculosSubject = new BehaviorSubject<Vehiculo[]>([]);
  vehiculos$ = this.vehiculosSubject.asObservable();

  constructor(private firestore: AngularFirestore) {
    //* Inicializa el servicio al obtener los vehículos
    this.loadVehiculos();
  }

  //* Método para cargar los vehículos desde Firestore y actualizar el BehaviorSubject
  private async loadVehiculos() {
    const vehiculosSnapshot = await firstValueFrom(this.firestore.collection<Vehiculo>('vehiculos').get());
    const vehiculos = vehiculosSnapshot.docs.map(doc => {
      const data = doc.data() as Vehiculo;
      return {
        ...data,
        uid: doc.id //* Asignar el ID de Firestore como uid del vehículo
      };
    });
    this.vehiculosSubject.next(vehiculos);
  }

  //* Agregar un vehículo a Firestore usando su UID
  async addVehiculo(vehiculo: Vehiculo): Promise<void> {
    const docRef = await this.firestore.collection('vehiculos').add(vehiculo);
    vehiculo.uid = docRef.id; //* Asigna el UID generado por Firebase al vehículo
    await this.firestore.collection('vehiculos').doc(docRef.id).set(vehiculo); //* Guarda el vehículo con su UID
    this.loadVehiculos(); //* Recarga los vehículos para actualizar el BehaviorSubject
  }

  //* Obtener vehículos por UID de usuario
  async getVehiculosByUsuarioUID(usuarioUID: string): Promise<Vehiculo[]> {
    const vehiculosSnapshot = await firstValueFrom(
      this.firestore.collection<Vehiculo>('vehiculos', ref => ref.where('usuarioUID', '==', usuarioUID)).get()
    );
    return vehiculosSnapshot.docs.map(doc => ({
      ...doc.data(),
      uid: doc.id //* Asigna el ID de Firestore como uid del vehículo
    })) as Vehiculo[];
  }

  //* Actualizar un vehículo en Firestore
  async updateVehiculo(uid: string, updatedVehiculo: Partial<Vehiculo>): Promise<void> {
    await this.firestore.collection('vehiculos').doc(uid).update(updatedVehiculo);
    this.loadVehiculos(); //* Recarga los vehículos para actualizar el BehaviorSubject
  }

  //* Eliminar un vehículo en Firestore
  async deleteVehiculo(uid: string): Promise<void> {
    await this.firestore.collection('vehiculos').doc(uid).delete();
    this.loadVehiculos(); //* Recarga los vehículos para actualizar el BehaviorSubject
  }
}
