import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelProveedorReporteComponent } from './sel-proveedor-reporte.component';

describe('SelProveedorReporteComponent', () => {
  let component: SelProveedorReporteComponent;
  let fixture: ComponentFixture<SelProveedorReporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelProveedorReporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelProveedorReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
