import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarObjetoComponent } from './asignar-objeto.component';

describe('AsignarObjetoComponent', () => {
  let component: AsignarObjetoComponent;
  let fixture: ComponentFixture<AsignarObjetoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignarObjetoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarObjetoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
