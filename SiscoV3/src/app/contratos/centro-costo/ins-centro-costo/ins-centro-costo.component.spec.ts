import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsCentroCostoComponent } from './ins-centro-costo.component';

describe('InsCentroCostoComponent', () => {
  let component: InsCentroCostoComponent;
  let fixture: ComponentFixture<InsCentroCostoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsCentroCostoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsCentroCostoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
