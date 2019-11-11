import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerGenericoComponent } from './banner-generico.component';

describe('BannerGenericoComponent', () => {
  let component: BannerGenericoComponent;
  let fixture: ComponentFixture<BannerGenericoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BannerGenericoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BannerGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
