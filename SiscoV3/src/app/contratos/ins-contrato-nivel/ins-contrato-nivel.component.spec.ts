import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsContratoNivelComponent } from './ins-contrato-nivel.component';

describe('InsContratoNivelComponent', () => {
  let component: InsContratoNivelComponent;
  let fixture: ComponentFixture<InsContratoNivelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsContratoNivelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsContratoNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
