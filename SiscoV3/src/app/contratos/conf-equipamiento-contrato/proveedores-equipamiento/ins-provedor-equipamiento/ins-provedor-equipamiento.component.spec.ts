import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsProvedorEquipamientoComponent } from './ins-provedor-equipamiento.component';

describe('InsProvedorEquipamientoComponent', () => {
  let component: InsProvedorEquipamientoComponent;
  let fixture: ComponentFixture<InsProvedorEquipamientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsProvedorEquipamientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsProvedorEquipamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
