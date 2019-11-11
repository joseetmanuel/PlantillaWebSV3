import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelPartidaReporteComponent } from './sel-partida-reporte.component';

describe('SelPartidaReporteComponent', () => {
  let component: SelPartidaReporteComponent;
  let fixture: ComponentFixture<SelPartidaReporteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelPartidaReporteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelPartidaReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
