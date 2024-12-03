import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { SwalService } from 'src/app/services/swal.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.page.html',
  styleUrls: ['./detalles.page.scss'],
})
export class DetallesPage implements OnInit {
  info: Usuario | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private SwalService: SwalService
  ) {}

  async ngOnInit() {
    this.loadProfile(); //* Cargar la información del perfil al inicializar
  }

  loadProfile() {
    this.usuarioService.currentUser$.subscribe((usuario) => {
      this.info = usuario;
    });
  }

  async eliminarCuenta() {
    await this.SwalService.warning(
      '¡Eliminación de cuenta!',
      '¿Proceder con la eliminación de su cuenta? Tendrás que crear otra cuenta después del proceso para ingresar a la app.',
      'Eliminar mi cuenta'
    ).then(async (result) => {
      //? Verificamos si el usuario hizo clic en "Eliminar mi cuenta"
      if (result.isConfirmed) {
        this.SwalService.loading('Eliminando su cuenta por favor espere...');

        try {
          if (await this.usuarioService.deleteUsuario(this.info!.uid)) {
            this.SwalService.cerrar();
            await this.SwalService.success('Cuenta eliminada. ¡Adios!').then(
              () => {
                this.router.navigate(['/login'], { replaceUrl: true });
              }
            );
          }
        } catch (error) {
          this.SwalService.cerrar();
          await this.SwalService.error(
            '¡Hubo un error al eliminar su cuenta, inténtelo nuevamente!'
          );
        }
      } else {
        //* Si el usuario cancela, no hacemos nada
        await this.SwalService.info('No se ha realizado ningún cambio.');
      }
    });
  }

  async showInfoAlert() {
    await this.SwalService.info(
      'Los datos de su cuenta solo pueden ser modificadas por un administrador. Por favor contacte con un administrador en caso de necesitarlo'
    );
  }
}
