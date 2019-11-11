import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsContratoComponent } from './ins-contrato.component';

describe('InsContratoComponent', () => {
  let component: InsContratoComponent;
  let fixture: ComponentFixture<InsContratoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsContratoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
