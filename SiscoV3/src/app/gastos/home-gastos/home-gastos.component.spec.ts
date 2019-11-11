import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeGastosComponent } from './home-gastos.component';

describe('HomeGastosComponent', () => {
  let component: HomeGastosComponent;
  let fixture: ComponentFixture<HomeGastosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeGastosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
