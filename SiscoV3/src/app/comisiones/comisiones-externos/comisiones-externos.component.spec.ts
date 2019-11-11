import { TestBed, async } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { ComisionesExternosComponent } from './comisiones-externos.component';
import { MatProgressSpinnerModule } from '@angular/material';
import { BreadcrumbsComponent } from 'src/app/utilerias/breadcrumbs/breadcrumbs.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('ComisionesExternosComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ComisionesExternosComponent,
        BreadcrumbsComponent
      ],
      imports: [
        MatProgressSpinnerModule,
        NgbModule,
        RouterModule
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ComisionesExternosComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
