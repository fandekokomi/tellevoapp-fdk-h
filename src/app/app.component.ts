import { Component } from "@angular/core";
import { Page } from "./interfaces/page";
import { Router } from "@angular/router";
import { UsuarioService } from "./services/usuario.service";
import { MenuController } from "@ionic/angular";
import { Usuario } from "./interfaces/usuario";
import { Observable } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  public appPages: Page[] = [];
  public tipousuario?: string;
  public username?: string;
  public descripcion?: string;
  public currentUser$: Observable<Usuario | null>;

  constructor(private router: Router, private usuarioService: UsuarioService, private menu: MenuController) {
    //* Asignar el observable directamente
    this.currentUser$ = this.usuarioService.currentUser$;
  }

  ngOnInit() {
    //* Cambiar a la suscripción a currentUser$ dentro del template o usar el async pipe
    this.currentUser$.subscribe((usuario) => {
      if (usuario) {
        this.tipousuario = usuario.tipo;
        this.username = usuario.nombre;
        this.configSideMenu();
      } else {
        //* Si no hay usuario, limpiar el menú
        this.clearSideMenu();
      }
    });
  }

  configSideMenu() {
    if (this.tipousuario === 'admin') {
      this.descripcion = "Panel de administrador";
      this.appPages = [
        { title: 'Admin Dashboard', icono: 'home', action: () => this.router.navigate(['/adminDashboard']) },
        { title: 'Administrar Usuarios', icono: 'people', action: () => this.router.navigate(['/administracion-usuarios']) },
        { title: 'Administrar Viajes', icono: 'car', action: () => this.router.navigate(['/administracion-viajes']) },
        { title: 'Cerrar Sesión', action: () => this.logout(), icono: 'log-out' },
      ];
    } else {
      this.descripcion = "Menú del usuario";
      this.appPages = [
        { title: 'Home', icono: 'home', action: () => this.router.navigate(['/home']) },
        { title: 'Viajes', icono: 'car', action: () => this.router.navigate(['/viajes']) },
        { title: 'Perfil', icono: 'person-circle', action: () => this.router.navigate(['/perfil']) },
        { title: 'Cerrar Sesión', action: () => this.logout(), icono: 'log-out' },
      ];
    }
  }

  clearSideMenu() {
    this.appPages = []; //* Limpiar el menú si no hay usuario
    this.descripcion = ''; //* Limpiar la descripción
  }

  logout() {
    this.usuarioService.logout();
    this.menu.enable(false);
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}