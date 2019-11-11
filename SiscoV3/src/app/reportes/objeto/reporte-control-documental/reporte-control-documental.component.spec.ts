import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteControlDocumentalComponent } from './reporte-control-documental.component';

describe('ReporteControlDocumentalComponent', () => {
  let component: ReporteControlDocumentalComponent;
  let fixture: ComponentFixture<ReporteControlDocumentalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteControlDocumentalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteControlDocumentalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
