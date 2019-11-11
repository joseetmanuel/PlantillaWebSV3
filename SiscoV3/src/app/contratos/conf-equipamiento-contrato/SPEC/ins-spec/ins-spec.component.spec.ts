import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsSpecComponent } from './ins-spec.component';

describe('InsSpecComponent', () => {
  let component: InsSpecComponent;
  let fixture: ComponentFixture<InsSpecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsSpecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
