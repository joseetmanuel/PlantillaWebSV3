import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsAgrupadorTipoobjetoComponent } from './ins-agrupador-tipoobjeto.component';

describe('InsAgrupadorTipoobjetoComponent', () => {
  let component: InsAgrupadorTipoobjetoComponent;
  let fixture: ComponentFixture<InsAgrupadorTipoobjetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsAgrupadorTipoobjetoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsAgrupadorTipoobjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
