import {
  TestBed,
  async,
} from '@angular/core/testing';
import {SignupComponent, SignupForm} from './signup.component';
import User from '../../../../core/models/user';
import {Store, StoreModule} from '@ngrx/store';
import {AppStates, metaReducers, reducers} from '../../../../app.states';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SignUp} from '../../../../core/store/auth/auth.actions';

const SHARED_MOCKS = {
  username: 'toto',
  email: 'toto@toto.com',
  password: '123',
  resetCode: 'asdf',
  captcha: 'asdf',
};

describe('SignupComponent', () => {
  let component: SignupComponent;
  let store: Store<AppStates>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignupComponent
      ],
      imports: [
        FormsModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
      schemas: [
        NO_ERRORS_SCHEMA
      ],
    });
    (<any>window).grecaptcha = {
      getResponse: (): string => SHARED_MOCKS.captcha,
      reset: (): void => {},
      render: (id: string) => {}
    };
    store = TestBed.get(Store);
    component = new SignupComponent(store);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isLoading false, errorMessage undefined and an empty User as initial on construct', () => {
    component.ngOnInit();
    expect(component.isLoading).toBeFalsy();
    expect(component.errorMessage).toBeUndefined();
    expect(component.user).toEqual(new User());
  });

  it('should fire renderCaptcha function ngOnInit', () => {
    const dispatchSpy = spyOn(component, 'renderCaptcha');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('should render captcha on ngOnInit via renderCaptcha', () => {
    component.ngOnInit();
    expect(component.isCaptchaRendered).toBeTruthy();
  });

  it('should return void onSubmit if captcha is unavailable', () => {
    (<any>window).grecaptcha = {
      getResponse: (): string => '', // deliberately return an empty captcha
      reset: (): void => {},
      render: (id: string) => {}
    };
    const grecaptchaResetSpy = spyOn((<any>window).grecaptcha, 'reset');
    const dispatchSpy = spyOn(store, 'dispatch');
    const payload = {
      value: {
        email: SHARED_MOCKS.email,
        username: SHARED_MOCKS.username,
        password: SHARED_MOCKS.password,
        captcha: SHARED_MOCKS.captcha,
      },
    };
    component.ngOnInit();
    component.onSubmit(<SignupForm>payload);
    expect(component.isCaptchaValid).toBeFalsy();
    expect(grecaptchaResetSpy).toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch SignUp action onSubmit and set isLoading to true', () => {
    const dispatchSpy = spyOn(store, 'dispatch');
    const payload = {
      value: {
        email: SHARED_MOCKS.email,
        username: SHARED_MOCKS.username,
        password: SHARED_MOCKS.password,
        captcha: SHARED_MOCKS.captcha,
      },
    };
    const action = new SignUp(payload.value);
    component.ngOnInit();
    component.onSubmit(<SignupForm>payload);
    expect(component.isLoading).toBeTruthy();
    expect(dispatchSpy).toHaveBeenCalledWith(action);

  });

});