import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdContratoComponent } from './upd-contrato.component';

describe('UpdContratoComponent', () => {
  let component: UpdContratoComponent;
  let fixture: ComponentFixture<UpdContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
