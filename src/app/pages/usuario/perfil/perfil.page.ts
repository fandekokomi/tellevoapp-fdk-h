import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/interfaces/usuario';
import Swal from 'sweetalert2'; //* Importa SweetAlert

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  info: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) {}

  async ngOnInit() {
    this.usuarioService.currentUser$.subscribe((usuario) => {
      this.info = usuario;
    })
  }

  //* Método para mostrar el SweetAlert
  showInfoAlert() {
    Swal.fire({
      title: 'Información',
      text: 'Los datos de su cuenta solo pueden ser modificadas por un administrador. Porfavor contacte con un administrador en caso de necesitarlo',
      icon: 'info',
      heightAuto: false,
    });
  }
}