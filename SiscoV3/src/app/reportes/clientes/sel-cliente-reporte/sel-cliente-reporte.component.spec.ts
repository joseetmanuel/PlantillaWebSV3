import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelClienteReporteComponent } from './sel-cliente-reporte.component';

describe('SelClienteReporteComponent', () => {
  let component: SelClienteReporteComponent;
  let fixture: ComponentFixture<SelClienteReporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelClienteReporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelClienteReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
