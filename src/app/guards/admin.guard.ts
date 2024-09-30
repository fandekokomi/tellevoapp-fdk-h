import { CanActivateFn } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';  //* Importa servicio de usuario
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = async (route, state) => {
  const usuarioService = inject(UsuarioService);  //* Inyecta el servicio de usuario
  const router = inject(Router);

  try {
    const currentUser = await usuarioService.getCurrentUser();  //* Obtiene el usuario actual

    if (currentUser && currentUser.tipo === 'admin') {  //* Verifica si el usuario es de tipo admin
      return true;  //* Permite el acceso
    } else {
      router.navigate(['/home'], {replaceUrl: true});  //* Redirige al login si no es admin
      return false;
    }
  } catch (error) {
    console.error('Error verificando el usuario:', error);
    router.navigate(['/home'], {replaceUrl: true});  //* Redirige al login en caso de error
    return false;
  }
};