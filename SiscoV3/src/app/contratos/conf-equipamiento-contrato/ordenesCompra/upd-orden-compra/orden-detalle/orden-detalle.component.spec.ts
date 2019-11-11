import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenDetalleComponent } from './orden-detalle.component';

describe('OrdenDetalleComponent', () => {
  let component: OrdenDetalleComponent;
  let fixture: ComponentFixture<OrdenDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenDetalleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
