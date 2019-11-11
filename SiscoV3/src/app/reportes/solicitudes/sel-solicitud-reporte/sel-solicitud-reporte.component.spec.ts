import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelSolicitudReporteComponent } from './sel-solicitud-reporte.component';

describe('SelSolicitudReporteComponent', () => {
  let component: SelSolicitudReporteComponent;
  let fixture: ComponentFixture<SelSolicitudReporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelSolicitudReporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelSolicitudReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
