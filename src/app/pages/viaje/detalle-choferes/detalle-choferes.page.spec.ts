import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleChoferesPage } from './detalle-choferes.page';

describe('DetalleChoferesPage', () => {
  let component: DetalleChoferesPage;
  let fixture: ComponentFixture<DetalleChoferesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleChoferesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
