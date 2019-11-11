import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelContratosComponent } from './sel-contratos.component';

describe('SelContratosComponent', () => {
  let component: SelContratosComponent;
  let fixture: ComponentFixture<SelContratosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelContratosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelContratosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
