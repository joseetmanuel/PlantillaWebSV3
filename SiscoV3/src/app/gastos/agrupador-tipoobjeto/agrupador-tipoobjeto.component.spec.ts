import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgrupadorTipoobjetoComponent } from './agrupador-tipoobjeto.component';

describe('AgrupadorTipoobjetoComponent', () => {
  let component: AgrupadorTipoobjetoComponent;
  let fixture: ComponentFixture<AgrupadorTipoobjetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgrupadorTipoobjetoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgrupadorTipoobjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
