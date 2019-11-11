import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelOrdenesCompraComponent } from './sel-ordenes-compra.component';

describe('SelOrdenesCompraComponent', () => {
  let component: SelOrdenesCompraComponent;
  let fixture: ComponentFixture<SelOrdenesCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelOrdenesCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelOrdenesCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
