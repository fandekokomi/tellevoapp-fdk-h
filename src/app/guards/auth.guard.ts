import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UsuarioService } from '../services/usuario.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private usuarioService: UsuarioService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.usuarioService.isAuthenticated$.pipe(
      switchMap(isLoggedIn => {
        //console.log('Usuario autenticado:', isLoggedIn);
        if (isLoggedIn) {
          //* Si el usuario está autenticado, redirigimos a home o adminDashboard según su tipo
          return this.usuarioService.getCurrentUserAsObservable().pipe(
            switchMap(user => {
              //console.log('Usuario actual:', user);
              if (user && user.tipo === 'admin') {
                this.router.navigate(['adminDashboard'], { replaceUrl: true });
              } else {
                this.router.navigate(['home'], { replaceUrl: true });
              }
              return [false]; //* Bloquea el acceso a la ruta protegida
            })
          );
        } else {
          return [true]; //* Permite el acceso si no está autenticado
        }
      })
    );
  }
}