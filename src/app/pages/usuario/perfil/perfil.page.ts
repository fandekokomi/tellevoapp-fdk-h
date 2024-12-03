import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  tipoUsuario!: string;
  constructor(private usuarioService: UsuarioService) {}

  async ngOnInit() {
    this.loadProfile(); //* Cargar la información del perfil al inicializar
  }

  loadProfile() {
    this.usuarioService.currentUser$.subscribe((usuario) => {
      this.tipoUsuario = usuario!.tipo;
    });
  }

}