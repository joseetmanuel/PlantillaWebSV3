import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarOperadorComponent } from './asignar-operador.component';

describe('AsignarOperadorComponent', () => {
  let component: AsignarOperadorComponent;
  let fixture: ComponentFixture<AsignarOperadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignarOperadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarOperadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
