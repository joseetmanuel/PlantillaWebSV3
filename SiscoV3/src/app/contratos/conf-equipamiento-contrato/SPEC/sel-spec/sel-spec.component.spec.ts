import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelSpecComponent } from './sel-spec.component';

describe('SelSpecComponent', () => {
  let component: SelSpecComponent;
  let fixture: ComponentFixture<SelSpecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelSpecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
