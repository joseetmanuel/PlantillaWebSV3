import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsProveedorContratoComponent } from './ins-proveedor-contrato.component';

describe('InsProveedorContratoComponent', () => {
  let component: InsProveedorContratoComponent;
  let fixture: ComponentFixture<InsProveedorContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsProveedorContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsProveedorContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
