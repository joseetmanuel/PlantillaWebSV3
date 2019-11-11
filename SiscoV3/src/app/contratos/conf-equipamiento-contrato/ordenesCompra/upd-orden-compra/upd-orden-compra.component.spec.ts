import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdOrdenCompraComponent } from './upd-orden-compra.component';

describe('UpdOrdenCompraComponent', () => {
  let component: UpdOrdenCompraComponent;
  let fixture: ComponentFixture<UpdOrdenCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdOrdenCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdOrdenCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
