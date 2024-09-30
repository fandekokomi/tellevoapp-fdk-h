import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditarUsuarioModalComponent } from 'src/app/components/editar-usuario-modal/editar-usuario-modal.component';
import { Usuario } from 'src/app/interfaces/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-administracion-usuarios',
  templateUrl: './administracion-usuarios.page.html',
  styleUrls: ['./administracion-usuarios.page.scss'],
})
export class AdministracionUsuariosPage implements OnInit {

  usuarios: Usuario[] = [];
  usuariosPaginados: Usuario[] = [];
  paginaActual: number = 1;
  usuariosPorPagina: number = 3;
  totalPaginas: number = 1;
  tipoFiltro: string = 'todos';

  constructor(private modalController: ModalController, private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.cargarUsuarios();
  }

  async editarUsuario(index: number) {
    const usuarioIndex = (this.paginaActual - 1) * this.usuariosPorPagina + index;
    const usuario = this.usuarios[usuarioIndex];

    const modal = await this.modalController.create({
      component: EditarUsuarioModalComponent,
      componentProps: { usuario }
    });

    modal.onDidDismiss().then(async () => {
      await this.cargarUsuarios(); //* Recargar todos los usuarios
    });

    return await modal.present();
  }

  private async cargarUsuarios() {
    this.usuarios = (await this.usuarioService.getUsuarios()).filter(usuario => usuario.tipo !== 'admin');
    this.actualizarUsuariosPaginados(); //* Llama aquí para inicializar la paginación
  }

  private actualizarUsuariosPaginados() {
    //* Filtrar usuarios según el tipo seleccionado
    const usuariosFiltrados = this.usuarios.filter(usuario => this.tipoFiltro === 'todos' || usuario.tipo === this.tipoFiltro);
    
    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    const fin = inicio + this.usuariosPorPagina;

    this.usuariosPaginados = usuariosFiltrados.slice(inicio, fin);
    this.totalPaginas = Math.ceil(usuariosFiltrados.length / this.usuariosPorPagina); //* Actualiza totalPaginas aquí
  }

  public previous() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarUsuariosPaginados();
    }
  }

  public next() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarUsuariosPaginados();
    }
  }

  public async delete(index: number) {
    const usuarioIndex = (this.paginaActual - 1) * this.usuariosPorPagina + index;
    const usuario = this.usuarios[usuarioIndex];
  
    //* Muestra una alerta de confirmación utilizando SweetAlert
    const confirm = await Swal.fire({
      title: 'Confirmar Eliminación',
      text: `¿Está seguro de que desea eliminar al usuario ${usuario.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      heightAuto: false
    });
  
    //* Si el usuario confirma la eliminación
    if (confirm.isConfirmed) {
      //* Muestra un SweetAlert de carga
      const loading = Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor, espere...',
        didOpen: () => {
          Swal.showLoading(); //* Muestra el loading
        },
        allowOutsideClick: false,
        showConfirmButton: false
      });
  
      try {
        const eliminado = await this.usuarioService.deleteUsuario(usuario.email);
        if (eliminado) {
          this.usuarios.splice(usuarioIndex, 1);
          this.totalPaginas = Math.ceil(this.usuarios.length / this.usuariosPorPagina);
          if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas;
          }
          //* Cierra el loading y muestra un mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Aviso',
            html: '¡El usuario ${usuario.nombre} ha sido eliminado con éxito!',
            showConfirmButton: true,
            confirmButtonText: 'OK',
          }).then(async () => {
            (await loading).dismiss
          });
          this.actualizarUsuariosPaginados();
        }
      } catch (error) {
        //* Cierra el loading y muestra un mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'ERROR',
          html: '¡No se pudo eliminar el usuario!',
          showConfirmButton: true,
          confirmButtonText: 'OK',
        }).then(async () => {
          (await loading).dismiss
        });
      }
    }
  }

  public filtrarUsuarios(tipo: string) {
    this.tipoFiltro = tipo;
    this.paginaActual = 1; //* Reinicia a la primera página al filtrar
    this.actualizarUsuariosPaginados();
  }

}
