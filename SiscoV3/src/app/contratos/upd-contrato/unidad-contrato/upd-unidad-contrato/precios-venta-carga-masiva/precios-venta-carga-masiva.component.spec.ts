import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreciosVentaCargaMasivaComponent } from './precios-venta-carga-masiva.component';

describe('PreciosVentaCargaMasivaComponent', () => {
  let component: PreciosVentaCargaMasivaComponent;
  let fixture: ComponentFixture<PreciosVentaCargaMasivaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreciosVentaCargaMasivaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreciosVentaCargaMasivaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
