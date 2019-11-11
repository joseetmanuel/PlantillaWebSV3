import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelProveedoresEquipamientoComponent } from './sel-proveedores-equipamiento.component';

describe('SelProveedoresEquipamientoComponent', () => {
  let component: SelProveedoresEquipamientoComponent;
  let fixture: ComponentFixture<SelProveedoresEquipamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelProveedoresEquipamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelProveedoresEquipamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
