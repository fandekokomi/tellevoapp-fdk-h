import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  return usuarioService.isLogged().pipe(
    switchMap(isLoggedIn => {
      const publicRoutes = ['login', 'register', 'recuperar-contrasena', 'loginp'];

      if (isLoggedIn) {
        return usuarioService.getCurrentUserAsObservable().pipe(
          switchMap(user => {
            //* Si el usuario está logeado, bloquear las rutas públicas
            if (publicRoutes.some(routeName => state.url.includes(routeName))) {
              //* Redirigir al home o adminDashboard según el tipo de usuario
              if (user && user.tipo === 'admin') {
                router.navigate(['adminDashboard'], { replaceUrl: true });
              } else {
                router.navigate(['home'], { replaceUrl: true });
              }
              return [false]; //* Bloquear acceso a rutas públicas
            }
            return [true]; //* Permitir acceso a las rutas protegidas
          })
        );
      } else {
        //* Si no está autenticado, bloquear rutas protegidas (home, adminDashboard, etc.)
        if (!publicRoutes.some(routeName => state.url.includes(routeName))) {
          router.navigate(['login'], { replaceUrl: true });
          return [false]; //* Bloquear acceso a rutas protegidas
        }
        return [true]; //* Permitir acceso a rutas públicas
      }
    })
  );
};