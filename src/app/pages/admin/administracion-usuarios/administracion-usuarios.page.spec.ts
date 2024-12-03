import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracionUsuariosPage } from './administracion-usuarios.page';

describe('AdministracionUsuariosPage', () => {
  let component: AdministracionUsuariosPage;
  let fixture: ComponentFixture<AdministracionUsuariosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionUsuariosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
