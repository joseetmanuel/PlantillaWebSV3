import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsOrdenCompraComponent } from './ins-orden-compra.component';

describe('InsOrdenCompraComponent', () => {
  let component: InsOrdenCompraComponent;
  let fixture: ComponentFixture<InsOrdenCompraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsOrdenCompraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsOrdenCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
