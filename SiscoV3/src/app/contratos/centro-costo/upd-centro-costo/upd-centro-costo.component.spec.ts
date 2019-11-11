import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdCentroCostoComponent } from './upd-centro-costo.component';

describe('UpdCentroCostoComponent', () => {
  let component: UpdCentroCostoComponent;
  let fixture: ComponentFixture<UpdCentroCostoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdCentroCostoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdCentroCostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
