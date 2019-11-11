import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioTareaComponent } from './usuario-tarea.component';

describe('UsuarioTareaComponent', () => {
  let component: UsuarioTareaComponent;
  let fixture: ComponentFixture<UsuarioTareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsuarioTareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
