import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdSpecComponent } from './upd-spec.component';

describe('UpdSpecComponent', () => {
  let component: UpdSpecComponent;
  let fixture: ComponentFixture<UpdSpecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdSpecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdSpecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
