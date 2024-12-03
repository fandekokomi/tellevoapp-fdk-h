import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { GithubAuthProvider } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { firstValueFrom, BehaviorSubject, Observable, from } from 'rxjs';
import { VehiculoService } from './vehiculo.service';
import { GoogleAuth } from'@codetrix-studio/capacitor-google-auth';
import { Plugins } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private firestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private vs: VehiculoService,
    private platform: Platform
  ) {
    GoogleAuth.initialize({clientId: '926921643583-7v216n9qrk8tfelei5iu2g1cv9la3hpa.apps.googleusercontent.com',
      scopes: ["profile", "email"],
      grantOfflineAccess: true
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

  //* Método para generar 10 usuarios automáticamente desde Random User API
  async generarUsuariosAleatorios(): Promise<void> {
    const usuariosValidos: Array<any> = [];
    const regexNombre = /^[A-Za-z\s]+$/; //* Para validar nombres
    const regexEmail = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/; //* Para validar correos electrónicos
    const regexEspacio = /\s/; //* Para detectar espacios en nombres/apellidos
  
    try {
      while (usuariosValidos.length < 10) {
        const response = await fetch('https://randomuser.me/api/?results=10');
        const data = await response.json();
        const usuarios = data.results;
  
        const usuariosFiltrados = usuarios.filter((usuario: any) => {
          const nombre = usuario.name.first;
          const apellido = usuario.name.last;
          return regexNombre.test(nombre) && regexNombre.test(apellido) && !regexEspacio.test(nombre) && !regexEspacio.test(apellido);
        });
  
        //* Aquí indicamos cuántos usuarios válidos se han encontrado
        console.log(`Usuarios válidos encontrados: ${usuariosFiltrados.length}`);
  
        usuariosFiltrados.forEach((usuario: any) => {
          if (usuariosValidos.length < 10) {
            usuariosValidos.push(usuario);
          }
        });
      }
  
      console.log(`Se generaron ${usuariosValidos.length} usuarios válidos.`); //* Mensaje de éxito
  
      for (let i = 0; i < usuariosValidos.length; i++) {
        const usuario = usuariosValidos[i];
        const nombre = usuario.name.first.replace(/\s+/g, '.'); //* Reemplaza espacios por puntos
        const apellido = usuario.name.last.replace(/\s+/g, '.'); //* Reemplaza espacios por puntos
        const tipo = i < 5 ? 'chofer' : 'pasajero';
        const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${tipo}.cl`;
        const password = 'Contra12345';
  
        //* Validar el formato del email
        if (!regexEmail.test(email)) {
          console.error('Email no válido:', email);
          continue; 
        }
  
        //* Intentar registrar el usuario y manejar errores
        try {
          await this.register(email, password, tipo, nombre, apellido);
          console.log(`Usuario registrado: ${nombre} ${apellido}, Email: ${email}`); //* Mensaje de éxito al registrar
        } catch (error) {
          console.error(`Error registrando el usuario ${nombre} ${apellido} con email ${email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error al generar usuarios aleatorios:', error);
    }
  }
  
  async loginWithProvider(proveedor: string) {
    let provider;
    if (proveedor.toLowerCase() === 'github') {
      provider = new GithubAuthProvider();
    } else if (proveedor.toLowerCase() === 'google') {
      provider = new GoogleAuthProvider();
    } else {
      throw new Error('Proveedor no existe');
    }
  
    try {
      if (this.platform.is('capacitor')) {
        const userGoogle = await GoogleAuth.signIn();
        if (userGoogle) {
          const credential = GoogleAuthProvider.credential(userGoogle.authentication.idToken);
          await this.angularFireAuth.signInWithCredential(credential);
        } else {
          throw new Error('Fallo al iniciar sesión con Google');
        }
      } else {
        await this.angularFireAuth.signInWithPopup(provider);
      }
    } catch (error) {
      throw error;
    }
  }  

  async completeRegisterWithProvider(nombre: string, apellido: string, tipoUsuario: string, proveedor: string): Promise<void> {
    const user = await this.angularFireAuth.currentUser;
    if (user) {
      const usuario: Usuario = {
        email: user.email || '',
        tipo: tipoUsuario,
        nombre: nombre,
        apellido: apellido,
        uid: user.uid,
      };
      //* Guardamos al usuario en Firestore
      await this.firestore.collection('usuarios').doc(user.uid).set(usuario);
      this.currentUserSubject.next(usuario);
    } else {
      throw new Error(`No se pudo terminar de registrar debido a un fallo de comunicación entre ${proveedor.toLowerCase()} y la app`);
    }
  }


  async eliminarUsuarioParaAdmin(uid: string): Promise<Boolean>{
    try {
      const user = await this.getUsuarioByUID(uid);
      if (user) {
        //* Si el usuario es un "chofer", eliminamos el vehículo asociado
        if (user.tipo === 'chofer') {
          await this.vs.deleteVehiculoByUsuarioUID(uid);
        }
        //* Eliminar el documento del usuario en Firestore
        await this.firestore.collection('usuarios').doc(uid).delete();

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar usuario::', error)
      return false;
    }
  }

  async getUserUID(){
    let uid: string;
    this.currentUser$.subscribe((user) => {
      uid = user!.uid;
    });
    return uid!
  }

  //* Obtener todos los usuarios desde Firestore y mapearlos a la interfaz Usuario
  async getUsuarios(): Promise<Usuario[]> {
    const usersSnapshot = await firstValueFrom(
      this.firestore.collection('usuarios').get()
    );
    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data() as Usuario;
      return {
        email: data.email,
        tipo: data.tipo,
        nombre: data.nombre,
        apellido: data.apellido,
        uid: data.uid,
      } as Usuario;
    });
    return users;
  }

  async getUsuarioByUID(uid: string): Promise<Usuario | undefined> {
    const users = await firstValueFrom(
      this.firestore
        .collection<Usuario>('usuarios', (ref) => ref.where('uid', '==', uid))
        .valueChanges()
    );

    return users.length > 0
      ? ({
          email: users[0].email,
          nombre: users[0].nombre,
          apellido: users[0].apellido,
          tipo: users[0].tipo,
          uid: users[0].uid,
        } as Usuario)
      : undefined;
  }

  //* Agregar un usuario a Firestore usando el UID del objeto Usuario
  async addUsuario(usuario: Usuario): Promise<void> {
    await this.firestore.collection('usuarios').doc(usuario.uid).set(usuario);
  }

  //* Eliminar al usuario actual por UID desde Firebase
  async deleteUsuario(uid: string): Promise<boolean> {
    try {
      //* Obtenemos el usuario autenticado
      const u = await this.angularFireAuth.currentUser;

      if (u) {
        //* Si el tipo de usuario es 'chofer', eliminamos el vehículo asociado
        const user = await this.getUsuarioByUID(uid);
        if (user && user.tipo === 'chofer') {
          await this.vs.deleteVehiculoByUsuarioUID(uid);
        }

        //* Eliminamos la cuenta del usuario actual en Firebase Authentication
        await u.delete();

        //* Ahora, eliminamos la data del usuario en Firestore
        await this.firestore.collection('usuarios').doc(uid).delete();

        //* Si todo fue exitoso, devolvemos true
        return true;
      } else {
        throw new Error('No se encontró un usuario autenticado.');
      }
    } catch (error) {
      throw error;
    }
  }

  //* Actualizar un usuario en Firestore
  async updateUsuario(
    email: string,
    updatedUsuario: Partial<Usuario>
  ): Promise<boolean> {
    try {
      const actions = await firstValueFrom(
        this.firestore
          .collection('usuarios', (ref) => ref.where('email', '==', email))
          .snapshotChanges()
      );

      if (actions.length > 0) {
        const docId = actions[0].payload.doc.id;
        await this.firestore
          .collection('usuarios')
          .doc(docId)
          .update(updatedUsuario);
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
  async register(
    email: string,
    pass: string,
    tipo: string,
    nombre: string,
    apellido: string
  ): Promise<boolean> {
    try {
      const userCredential =
        await this.angularFireAuth.createUserWithEmailAndPassword(email, pass);
      const uid = userCredential.user?.uid;

      if (uid) {
        const nuevoUsuario: Usuario = { email, tipo, nombre, apellido, uid };
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
    if (user) {
      const usuario = await this.getUsuarioByUID(user.uid); //* Devuelve el usuario desde Firestore
      return usuario!;
    }
    return null; //* Devuelve null si no hay usuario autenticado
  }

  //* método que retorna un observable del usuario actual
  getCurrentUserAsObservable(): Observable<Usuario | null> {
    return from(this.getCurrentUser());
  }

  //* Login de usuario
  async login(email: string, pass: string): Promise<any> {
    //* Verificar si el usuario existe en Firestore antes de intentar el login
    const usuarioNoExiste = await this.verificarUsuarioEnFirestore(email);
  
    if (usuarioNoExiste) {
      throw new Error('El usuario con este correo no existe');
    }
  
    //* Si el usuario existe, proceder con el login
    const userCredential =
      await this.angularFireAuth.signInWithEmailAndPassword(email, pass);
  
    //* Obtiene el usuario y lo actualiza en el BehaviorSubject
    const usuario = await this.getUsuarioByUID(userCredential.user?.uid!);
    this.currentUserSubject.next(usuario!);
  
    return userCredential;
  }

  private async verificarUsuarioEnFirestore(email: string): Promise<boolean> {
    const snapshot = await firstValueFrom(this.firestore.collection('usuarios', ref => ref.where('email', '==', email)).get());
  
    //* Si no hay documentos, el usuario no existe
    return snapshot.empty;
  }

  //* Logout de usuario
  async logout(): Promise<void> {
    await this.angularFireAuth.signOut();
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

  //* metodo que verifica el estado de autenticación del usuario.
  isLogged(): Observable<any> {
    return this.angularFireAuth.authState;
  }
}