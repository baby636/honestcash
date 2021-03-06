import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {EditorPublishModalComponent} from './publish-modal.component';
import {FormsModule} from '@angular/forms';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppStates} from '../../../app.states';
import Story from '../../../story/models/story';
import {WindowToken} from '../../../../core/shared/helpers/window.helper';
import {localStorageProvider, LocalStorageToken} from '../../../../core/shared/helpers/local-storage.helper';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ToastrModule, ToastrService} from 'ngx-toastr';
import {EditorService} from '../../services/editor.service';
import {EditorStorySaveAndPublish} from '../../store/editor.actions';
import {EDITOR_STORY_PROPERTIES} from '../../shared/editor.story-properties';
import {Store} from '@ngrx/store';
import {initialAppStates} from '../../../app.states.mock';
import {EDITOR_STATUS, initialEditorState} from '../../store/editor.state';

const MockWindow = {
  location: {
    href: '',
  }
};

const MockActiveModal = {
  close: () => {}
};

const MockToastr = {
  success: (message: string, title: string, override: {positionClass: string}) => {
  }
};

const initialState = {
  ...initialAppStates,
  editor: {
    ...initialEditorState,
    story: {
      ...new Story(),
      userPostHashtags: [
        {
          id: 1,
          hashtag: 'asdf',
          createdAt: 'ASDF',
          updatedAt: 'ASDF',
          userPostId: 4
        }
      ]
    },
  },

};

describe('EditorPublishModalComponent', () => {
  let component: EditorPublishModalComponent;
  let fixture: ComponentFixture<EditorPublishModalComponent>;
  let store: MockStore<AppStates>;
  let activeModal: NgbActiveModal;
  let toastr: ToastrService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NgbModule,
        ToastrModule.forRoot(),
      ],
      declarations: [EditorPublishModalComponent],
      providers: [
        provideMockStore({initialState}),
        EditorService,
        {provide: ToastrService, useValue: MockToastr},
        {provide: NgbActiveModal, useValue: MockActiveModal},
        {provide: WindowToken, useValue: MockWindow},
        {provide: 'PLATFORM_ID', useValue: 'browser'},
        {provide: LocalStorageToken, useFactory: localStorageProvider},
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ]
    });

    fixture = TestBed.createComponent(EditorPublishModalComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    activeModal = TestBed.get(NgbActiveModal);
    toastr = TestBed.get(ToastrService);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('functions', () => {
    describe('ngOnInit should', () => {

      it('set story and saveStatus', () => {
        const title = 'asdf';
        const status = EDITOR_STATUS.Publishing;
        const state = {
          ...initialState,
          editor: {
            ...initialEditorState,
            story: {
              ...new Story(),
              title
            },
            status
          }
        };
        store.setState(state);
        component.ngOnInit();
        expect(component.story.title).toEqual(title);
        expect(component.saveStatus).toEqual(status);
      });
      it('call toastr.success when saveStatus is Published', () => {
        const successSpy = spyOn(toastr, 'success').and.callThrough();
        const title = 'asdf';
        const status = EDITOR_STATUS.Published;
        const state = {
          ...initialState,
          editor: {
            ...initialEditorState,
            story: {
              ...new Story(),
              title
            },
            status
          }
        };
        store.setState(state);
        component.ngOnInit();
        expect(successSpy).toHaveBeenCalled();
      });
      it('NOT call toastr.success when saveStatus is NOT Published', () => {
        const successSpy = spyOn(toastr, 'success').and.callThrough();
        const title = 'asdf';
        const status = EDITOR_STATUS.NotSaved;
        const state = {
          ...initialState,
          editor: {
            ...initialEditorState,
            story: {
              ...new Story(),
              title
            },
            status
          }
        };
        store.setState(state);
        component.ngOnInit();
        expect(successSpy).not.toHaveBeenCalled();
      });
      it('call onClose when saveStatus is Published', () => {
        const onCloseSpy = spyOn(component, 'onClose').and.callThrough();
        const title = 'asdf';
        const status = EDITOR_STATUS.Published;
        const state = {
          ...initialState,
          editor: {
            ...initialEditorState,
            story: {
              ...new Story(),
              title
            },
            status
          }
        };
        store.setState(state);
        component.ngOnInit();
        expect(onCloseSpy).toHaveBeenCalled();
      });
      it('NOT call onClose when saveStatus is NOT Published', () => {
        const onCloseSpy = spyOn(component, 'onClose').and.callThrough();
        const title = 'asdf';
        const status = EDITOR_STATUS.NotSaved;
        const state = {
          ...initialState,
          editor: {
            ...initialEditorState,
            story: {
              ...new Story(),
              title
            },
            status
          }
        };
        store.setState(state);
        component.ngOnInit();
        expect(onCloseSpy).not.toHaveBeenCalled();
      });
    });

    describe('onSubmit should', () => {
      it('dispatch EditorStorySaveAndPublish with story and BodyAndTitle, Hashtags and PaidSection as property array', () => {
        const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();
        component.story = new Story();
        component.onSubmit();

        expect(dispatchSpy).toHaveBeenCalledWith(new EditorStorySaveAndPublish(component.story, [
          EDITOR_STORY_PROPERTIES.BodyAndTitle,
          EDITOR_STORY_PROPERTIES.Hashtags,
          EDITOR_STORY_PROPERTIES.PaidSection
        ]));
      });
    });

    describe('onClose should', () => {
      it('call activeModal.close', () => {
        const closeSpy = spyOn(activeModal, 'close');
        component.onClose();
        expect(closeSpy).toHaveBeenCalled();
      });
    });

    describe('ngOnDestroy should', () => {
      it('unsubscribe from editorState if it exists', () => {
        const editorSub = {
          unsubscribe: () => {}
        };
        const unsubscribeSpy = spyOn(editorSub, 'unsubscribe');
        component.editorSub = editorSub as any;
        component.ngOnDestroy();
        expect(unsubscribeSpy).toHaveBeenCalled();
      });
    });
  });
});
