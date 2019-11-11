import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdContratoNivelComponent } from './upd-contrato-nivel.component';

describe('UpdContratoNivelComponent', () => {
  let component: UpdContratoNivelComponent;
  let fixture: ComponentFixture<UpdContratoNivelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdContratoNivelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdContratoNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
