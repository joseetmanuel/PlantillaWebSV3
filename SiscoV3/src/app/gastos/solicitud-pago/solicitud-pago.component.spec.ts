import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudPagoComponent } from './solicitud-pago.component';

describe('SolicitudPagoComponent', () => {
  let component: SolicitudPagoComponent;
  let fixture: ComponentFixture<SolicitudPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
