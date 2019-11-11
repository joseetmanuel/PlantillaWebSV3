import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdAgrupadorTipoobjetoComponent } from './upd-agrupador-tipoobjeto.component';

describe('UpdAgrupadorTipoobjetoComponent', () => {
  let component: UpdAgrupadorTipoobjetoComponent;
  let fixture: ComponentFixture<UpdAgrupadorTipoobjetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdAgrupadorTipoobjetoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdAgrupadorTipoobjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
