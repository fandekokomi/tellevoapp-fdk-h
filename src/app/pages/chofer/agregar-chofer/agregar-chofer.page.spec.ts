import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarChoferPage } from './agregar-chofer.page';

describe('AgregarChoferPage', () => {
  let component: AgregarChoferPage;
  let fixture: ComponentFixture<AgregarChoferPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarChoferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
