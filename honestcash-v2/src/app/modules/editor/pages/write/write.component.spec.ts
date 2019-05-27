import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditorWriteComponent} from './write.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {provideMockStore} from '@ngrx/store/testing';
import {initialAppStates} from '../../../../core/mocks/app.states.mock';

describe('EditorWriteComponent', () => {
  let component: EditorWriteComponent;
  let fixture: ComponentFixture<EditorWriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [EditorWriteComponent],
      providers: [
        provideMockStore({initialState: initialAppStates})
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ]
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorWriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
