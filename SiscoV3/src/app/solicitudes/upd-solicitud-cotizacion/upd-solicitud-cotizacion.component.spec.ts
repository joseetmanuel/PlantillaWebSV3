import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdSolicitudCotizacionComponent } from './upd-solicitud-cotizacion.component';

describe('UpdSolicitudCotizacionComponent', () => {
  let component: UpdSolicitudCotizacionComponent;
  let fixture: ComponentFixture<UpdSolicitudCotizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdSolicitudCotizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdSolicitudCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
