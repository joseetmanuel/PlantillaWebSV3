import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdUnidadContratoComponent } from './upd-unidad-contrato.component';

describe('UpdUnidadContratoComponent', () => {
  let component: UpdUnidadContratoComponent;
  let fixture: ComponentFixture<UpdUnidadContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdUnidadContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdUnidadContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
