import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsGastoComponent } from './ins-gasto.component';

describe('InsGastoComponent', () => {
  let component: InsGastoComponent;
  let fixture: ComponentFixture<InsGastoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsGastoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
