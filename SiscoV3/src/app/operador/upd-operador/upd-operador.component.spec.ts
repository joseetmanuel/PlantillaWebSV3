import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdOperadorComponent } from './upd-operador.component';

describe('UpdOperadorComponent', () => {
  let component: UpdOperadorComponent;
  let fixture: ComponentFixture<UpdOperadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdOperadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdOperadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
