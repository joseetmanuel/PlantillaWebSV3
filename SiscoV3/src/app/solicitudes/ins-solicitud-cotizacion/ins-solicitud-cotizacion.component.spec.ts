import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsSolicitudCotizacionComponent } from './ins-solicitud-cotizacion.component';

describe('InsSolicitudCotizacionComponent', () => {
  let component: InsSolicitudCotizacionComponent;
  let fixture: ComponentFixture<InsSolicitudCotizacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsSolicitudCotizacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsSolicitudCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
