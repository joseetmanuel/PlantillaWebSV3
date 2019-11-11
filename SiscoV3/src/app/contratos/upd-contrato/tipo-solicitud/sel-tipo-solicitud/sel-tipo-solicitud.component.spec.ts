import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelTipoSolicitudComponent } from './sel-tipo-solicitud.component';

describe('SelTipoSolicitudComponent', () => {
  let component: SelTipoSolicitudComponent;
  let fixture: ComponentFixture<SelTipoSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelTipoSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelTipoSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
