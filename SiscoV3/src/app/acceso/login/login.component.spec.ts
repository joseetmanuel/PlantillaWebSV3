import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { MockStoreModule } from '@reibo/ngrx-mock-test';
import { initialState } from 'src/app/store/reducers/permisos.reducers';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app.states';

describe('LoginComponent', () => {
  const loginData: any = {
    email: 'mock@mail.com',
    password: 'mockpass'
  }

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MockStoreModule.forRoot('autenticacion', initialState)
      ],
      declarations: [LoginComponent],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Should Login', () => {
    expect(component.LogIn(loginData)).toBeUndefined();
  });
});
