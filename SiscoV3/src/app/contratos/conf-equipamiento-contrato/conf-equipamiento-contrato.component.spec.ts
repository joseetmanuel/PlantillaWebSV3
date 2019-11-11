import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipamientoContratoComponent } from './conf-equipamiento-contrato.component';

describe('EquipamientoContratoComponent', () => {
  let component: EquipamientoContratoComponent;
  let fixture: ComponentFixture<EquipamientoContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipamientoContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipamientoContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
