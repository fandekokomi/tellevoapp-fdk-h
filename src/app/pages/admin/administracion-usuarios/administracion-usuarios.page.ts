import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditarUsuarioModalComponent } from 'src/app/components/AdminComponents/editar-usuario-modal/editar-usuario-modal.component';
import { Usuario } from 'src/app/interfaces/usuario';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';

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

  constructor(private modalController: ModalController, private usuarioService: UsuarioService, private SwalService: SwalService) { }

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
    const confirm = await this.SwalService.warning('Confirmar Eliminación', `¿Está seguro de que desea eliminar al usuario ${usuario.nombre}?`, 'Confirmar');
  
    //* Si el usuario confirma la eliminación
    if (confirm.isConfirmed) {
      //* Muestra un SweetAlert de carga
      this.SwalService.loading(`Eliminando cuenta del usuario: ${usuario.nombre} - UID: ${usuario.uid}, por favor espere...`);
  
      const eliminado = await this.usuarioService.eliminarUsuarioParaAdmin(usuario.uid);
        if (eliminado) {
          this.usuarios.splice(usuarioIndex, 1);
          this.totalPaginas = Math.ceil(this.usuarios.length / this.usuariosPorPagina);
          if (this.paginaActual > this.totalPaginas) {
            this.paginaActual = this.totalPaginas;
          }
          //* Cierra el loading y muestra un mensaje de éxito
          this.SwalService.cerrar();
          await this.SwalService.success(`¡El usuario ${usuario.nombre} ha sido eliminado con éxito!`);
          this.actualizarUsuariosPaginados();
      } else {
        //* Cierra el loading y muestra un mensaje de error
        this.SwalService.error(`No se pudo eliminar al usuario: ${usuario.nombre}`);
      }
    }
  }

  public filtrarUsuarios(tipo: string) {
    this.tipoFiltro = tipo;
    this.paginaActual = 1; //* Reinicia a la primera página al filtrar
    this.actualizarUsuariosPaginados();
  }

}
