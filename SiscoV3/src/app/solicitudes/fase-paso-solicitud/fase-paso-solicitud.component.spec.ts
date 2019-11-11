import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FasePasoSolicitudComponent } from './fase-paso-solicitud.component';

describe('FasePasoSolicitudComponent', () => {
  let component: FasePasoSolicitudComponent;
  let fixture: ComponentFixture<FasePasoSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FasePasoSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FasePasoSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
