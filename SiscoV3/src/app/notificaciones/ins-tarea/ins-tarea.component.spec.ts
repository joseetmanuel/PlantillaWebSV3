import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsTareaComponent } from './ins-tarea.component';

describe('InsTareaComponent', () => {
  let component: InsTareaComponent;
  let fixture: ComponentFixture<InsTareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsTareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
