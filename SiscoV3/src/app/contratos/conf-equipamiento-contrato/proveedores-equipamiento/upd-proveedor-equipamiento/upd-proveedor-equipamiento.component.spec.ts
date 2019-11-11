import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdProveedorEquipamientoComponent } from './upd-proveedor-equipamiento.component';

describe('UpdProveedorEquipamientoComponent', () => {
  let component: UpdProveedorEquipamientoComponent;
  let fixture: ComponentFixture<UpdProveedorEquipamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdProveedorEquipamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdProveedorEquipamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
