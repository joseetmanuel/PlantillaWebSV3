import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelUnidadContratoComponent } from './sel-unidad-contrato.component';

describe('SelUnidadContratoComponent', () => {
  let component: SelUnidadContratoComponent;
  let fixture: ComponentFixture<SelUnidadContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelUnidadContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelUnidadContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
