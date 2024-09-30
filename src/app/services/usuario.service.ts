import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom, BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private firestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth
  ) { 
    //* Verifica el estado de autenticación en la inicialización
    this.angularFireAuth.onAuthStateChanged((user) => {
      this.isAuthenticatedSubject.next(!!user); //* Actualiza el estado
    });

    this.angularFireAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const usuario = await this.getUsuarioByUID(user.uid);
        this.currentUserSubject.next(usuario!);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  //* Obtener todos los usuarios desde Firestore y mapearlos a la interfaz Usuario
  async getUsuarios(): Promise<Usuario[]> {
    const usersSnapshot = await firstValueFrom(this.firestore.collection('usuarios').get());
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data() as Usuario;
      return {
        email: data.email,
        pass: data.pass,
        tipo: data.tipo,
        nombre: data.nombre,
        uid: data.uid
      } as Usuario;
    });
    return users;
  }  

  async getUsuarioByUID(uid: string): Promise<Usuario | undefined> {
    const users = await firstValueFrom(
      this.firestore.collection<Usuario>('usuarios', ref => ref.where('uid', '==', uid)).valueChanges()
    );

    return users.length > 0 ? ({
      email: users[0].email,
      pass: users[0].pass,
      tipo: users[0].tipo,
      nombre: users[0].nombre,
      uid: users[0].uid
    } as Usuario) : undefined;
  }

  //* Agregar un usuario a Firestore usando el UID del objeto Usuario
  async addUsuario(usuario: Usuario): Promise<void> {
    await this.firestore.collection('usuarios').doc(usuario.uid).set(usuario);
  }

  //* Eliminar un usuario por email desde Firebase
  async deleteUsuario(email: string): Promise<boolean> {
    try {
      const actions = await firstValueFrom(
        this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).snapshotChanges()
      );
  
      if (actions.length > 0) {
        const docId = actions[0].payload.doc.id;
  
        //TODO: investigar como borrar un usuario del firebase.
        //const userRecord = await this.angularFireAuth.getUserByEmail(email); //!esto no sirve ya que el angularFireAuth no tiene estos metodos
        //await this.angularFireAuth.deleteUser(userRecord.uid);
  
        //* Eliminamos la data del usuario.
        await this.firestore.collection('usuarios').doc(docId).delete();
  
        //* Si todo fue exitoso, devolvemos true
        return true;
      } else {
        console.error('Usuario no encontrado en Firestore');
        return false; //* Usuario no encontrado
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      return false; //* En caso de error, devolvemos false
    }
  }

  //* Actualizar un usuario en Firestore
  async updateUsuario(email: string, updatedUsuario: Partial<Usuario>): Promise<boolean> {
    try {
      const actions = await firstValueFrom(
        this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).snapshotChanges()
      );
  
      if (actions.length > 0) {
        const docId = actions[0].payload.doc.id;
        await this.firestore.collection('usuarios').doc(docId).update(updatedUsuario);
        return true; //* Usuario actualizado exitosamente
      } else {
        return false; //* Usuario no encontrado
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      return false; //* Error en la actualización
    }
  }  

  //* Registro de usuario en Firebase Authentication y Firestore
  async register(email: string, pass: string, tipo: string, nombre: string): Promise<boolean> {
    try {
      const userCredential = await this.angularFireAuth.createUserWithEmailAndPassword(email, pass);
      const uid = userCredential.user?.uid;

      if (uid) {
        const nuevoUsuario: Usuario = { email, pass, tipo, nombre, uid };
        await this.addUsuario(nuevoUsuario); //* Espera a que se complete la adición del usuario
        await this.angularFireAuth.signOut(); //* esto es porque al registar un usuario, firebase lo logea automaticamente.
        return true; //* Registro exitoso
      } else {
        throw new Error('Error al obtener el UID del usuario');
      }
    } catch (error) {
      throw error;
    }
  }

  async getCurrentUser(): Promise<Usuario | null> {
    const user = await this.angularFireAuth.currentUser; //* Obtiene el usuario actual
    //console.log('Usuario actual:', user);
    if (user) {
      const usuario = await this.getUsuarioByUID(user.uid); //* Devuelve el usuario desde Firestore
      //console.log(usuario);
      return usuario || null; //* Devuelve null si el usuario no se encuentra
    }
    return null; //* Devuelve null si no hay usuario autenticado
  }

  //* método que retorna un observable del usuario actual
  getCurrentUserAsObservable(): Observable<Usuario | null> {
    return from(this.getCurrentUser());
  }

  //* Login de usuario
  async login(email: string, pass: string): Promise<any> {
    const userCredential = await this.angularFireAuth.signInWithEmailAndPassword(email, pass);

    //* metodo que actualiza el estado si el user esta autenticado (lo usa el auth guard).
    this.isAuthenticatedSubject.next(!!userCredential.user); //* Actualiza el estado
    
    //* obtiene el usuario y lo actualiza en el BehaviorSubject.
    const usuario = await this.getUsuarioByUID(userCredential.user?.uid!);
    this.currentUserSubject.next(usuario!);
    return userCredential;
  }

  //* Logout de usuario
  async logout(): Promise<void> {
    await this.angularFireAuth.signOut();
    this.isAuthenticatedSubject.next(false); //* Actualiza el estado
    this.currentUserSubject.next(null); //* Emitir null al cerrar sesión
  }

  //* Recuperación de contraseña
  async recoveryPassword(email: string): Promise<void> {
    try {
      await this.angularFireAuth.sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }
}