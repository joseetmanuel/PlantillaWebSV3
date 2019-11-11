import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComisionesInternosComponent } from './comisiones-internos.component';

describe('ComisionesInternosComponent', () => {
  let component: ComisionesInternosComponent;
  let fixture: ComponentFixture<ComisionesInternosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComisionesInternosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComisionesInternosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
