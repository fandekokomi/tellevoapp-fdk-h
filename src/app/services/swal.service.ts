import { Injectable } from '@angular/core';
import Swal, { SweetAlertInput } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  constructor() { }

  async providerForm(): Promise<any> {
    const { value: formValues } = await Swal.fire({
      title: 'Complete su perfil',
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="Nombre">
        <input id="swal-input2" class="swal2-input" placeholder="Apellido">
        <select id="swal-input3" class="swal2-input">
          <option value="pasajero">Pasajero</option>
          <option value="chofer">Chofer</option>
        </select>
      `,
      focusConfirm: false,
      heightAuto: false,
      allowOutsideClick: false,
      preConfirm: () => {
        return {
          nombre: (document.getElementById('swal-input1') as HTMLInputElement).value,
          apellido: (document.getElementById('swal-input2') as HTMLInputElement).value,
          tipoUsuario: (document.getElementById('swal-input3') as HTMLSelectElement).value,
        };
      },
    });
  
    return formValues;
  }  

  async error(msj: string){
    return Swal.fire({
      title: '¡ERROR!',
      icon: 'error',
      text: msj,
      showConfirmButton: true,
      confirmButtonText: 'Reintentar',
      heightAuto: false,
    });
  }

  async info(msj: string){
    return Swal.fire({
      title: 'Info',
      icon: 'info',
      text: msj,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }

  async success(msj: string){
    return Swal.fire({
      title: 'Operación realizada correctamente',
      icon: 'success',
      text: msj,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      heightAuto: false
    });
  }

  loading(msj: string){
    return Swal.fire({
      title: 'Cargando',
      icon: 'info',
      text: msj,
      heightAuto: false,
      showConfirmButton: false,
      timerProgressBar: true,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  async warning(titulo: string, msj: string, confirmButtonText: string){
    return Swal.fire({
      title: titulo,
      text: msj,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar',
      heightAuto: false
    });
  }

  async input(titulo: string, msj: string, tipo: SweetAlertInput, min: string, max: string, step: string){
    return Swal.fire({
      title: titulo,
      text: msj,
      input: tipo,
      inputAttributes: {
        min: min,
        max: max,
        step: step,
      },
      showCancelButton: true,
      showConfirmButton: true,
      heightAuto: false,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });
  }

  cerrar(){
    Swal.close();
  }


  loading2(message: string) {
    //* Crea el contenedor del mensaje si no existe
    let loadingDiv = document.getElementById('custom-loading');
    if (!loadingDiv) {
      loadingDiv = document.createElement('div');
      loadingDiv.id = 'custom-loading';
      loadingDiv.style.position = 'fixed';
      loadingDiv.style.bottom = '10px';
      loadingDiv.style.right = '10px';
      loadingDiv.style.padding = '10px 20px';
      loadingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      loadingDiv.style.color = '#fff';
      loadingDiv.style.borderRadius = '5px';
      loadingDiv.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
      loadingDiv.style.zIndex = '1000'; //* Asegura que se muestre encima de otros elementos
      loadingDiv.style.display = 'flex';
      loadingDiv.style.alignItems = 'center';
      loadingDiv.style.fontSize = '14px';
      document.body.appendChild(loadingDiv);
    }
  
    // Agrega el mensaje
    loadingDiv.textContent = message;
  
    // Muestra el div
    loadingDiv.style.display = 'flex';
  }
  
  // Función para ocultar el mensaje de carga
  clearLoading2() {
    const loadingDiv = document.getElementById('custom-loading');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }
  
}
