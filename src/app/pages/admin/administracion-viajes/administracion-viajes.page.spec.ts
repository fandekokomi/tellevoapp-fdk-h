import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministracionViajesPage } from './administracion-viajes.page';

describe('AdministracionViajesPage', () => {
  let component: AdministracionViajesPage;
  let fixture: ComponentFixture<AdministracionViajesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministracionViajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
