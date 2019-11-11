import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelTareaComponent } from './panel-tarea.component';

describe('PanelTareaComponent', () => {
  let component: PanelTareaComponent;
  let fixture: ComponentFixture<PanelTareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelTareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelTareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
