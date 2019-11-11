import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelSolicitudPasoComponent } from './sel-solicitud-paso.component';

describe('SelSolicitudPasoComponent', () => {
  let component: SelSolicitudPasoComponent;
  let fixture: ComponentFixture<SelSolicitudPasoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelSolicitudPasoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelSolicitudPasoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
