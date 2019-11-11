import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsUnidadContratoComponent } from './ins-unidad-contrato.component';

describe('InsUnidadContratoComponent', () => {
  let component: InsUnidadContratoComponent;
  let fixture: ComponentFixture<InsUnidadContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsUnidadContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsUnidadContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
