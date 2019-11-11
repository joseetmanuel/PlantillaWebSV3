import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelCentroCostoComponent } from './sel-centro-costo.component';

describe('SelCentroCostoComponent', () => {
  let component: SelCentroCostoComponent;
  let fixture: ComponentFixture<SelCentroCostoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelCentroCostoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelCentroCostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
