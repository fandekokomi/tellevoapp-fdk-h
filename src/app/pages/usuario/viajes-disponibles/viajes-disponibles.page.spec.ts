import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViajesDisponiblesPage } from './viajes-disponibles.page';

describe('ViajesDisponiblesPage', () => {
  let component: ViajesDisponiblesPage;
  let fixture: ComponentFixture<ViajesDisponiblesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViajesDisponiblesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
