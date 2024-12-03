import { Injectable, ElementRef } from '@angular/core';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { SwalService } from './swal.service';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private codeReader = new BrowserMultiFormatReader();

  constructor(private SwalService: SwalService) {}

  async startScan(videoContainer: ElementRef) {
    try {
      const videoElement = videoContainer.nativeElement;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoElement.srcObject = stream;
      videoElement.setAttribute('playsinline', 'true');
      videoElement.play();

      videoElement.style.transform = 'scaleX(-1)';

      let scanning = true;

      const stopScan = () => {
        scanning = false;
        videoElement.srcObject = null;
        stream.getTracks().forEach((track) => track.stop());
      };

      this.codeReader.decodeFromVideoDevice(null, videoElement, async (result, error) => {
        if (result && scanning) {

        }

        if (error && !(error instanceof NotFoundException)) {
          await this.SwalService.error(`Error al escanear el QR: ${error.message}`);
        }
      });
    } catch (error: any) {
      await this.SwalService.error(`Error al intentar acceder a la cámara: ${error.message}`);
    }
  }
}