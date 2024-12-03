import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UsuarioService } from "src/app/services/usuario.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})

export class HomePage implements OnInit {
  usuarioNombre?: string;
  usuarioTipo?: string;

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.usuarioService.currentUser$.subscribe((usuario)=>{
      this.usuarioNombre = usuario?.nombre;
      this.usuarioTipo = usuario?.tipo;
    })
  }

  async logout() {
    await this.usuarioService.logout().then(()=>{
      this.router.navigate(['/login']);
    });
  }
}
