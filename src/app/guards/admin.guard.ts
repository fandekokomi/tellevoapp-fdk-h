import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { switchMap } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  return usuarioService.isLogged().pipe(
    switchMap(isLoggedIn => {
      if (isLoggedIn) {
        return usuarioService.getCurrentUserAsObservable().pipe(
          switchMap(user => {
            if (user && user.tipo === 'admin') {
              return [true]; //* Permitir acceso si es admin
            } else {
              router.navigate(['/home'], { replaceUrl: true }); //* Redirigir al home si no es admin
              return [false]; //* Bloquear acceso si no es admin
            }
          })
        );
      } else {
        router.navigate(['/login'], { replaceUrl: true }); //* Redirigir al login si no está autenticado
        return [false]; //* Bloquear acceso
      }
    })
  );
};