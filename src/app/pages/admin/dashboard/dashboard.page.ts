import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  adminusername: string = "admin";

  constructor(
    private menu: MenuController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.menu.enable(true);
    this.usuarioService.currentUser$.subscribe((usuario)=>{
      if (usuario) {
        this.adminusername = usuario.nombre;
      }
    });
  }
}
