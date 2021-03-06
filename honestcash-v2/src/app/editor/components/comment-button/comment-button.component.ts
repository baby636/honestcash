import {Component, HostBinding, Inject, OnDestroy, OnInit} from '@angular/core';
import {AppStates, selectEditorState} from '../../../app.states';
import {Store} from '@ngrx/store';
import Story from '../../../story/models/story';
import {ToastrService} from 'ngx-toastr';
import {Observable, Subscription} from 'rxjs';
import {EditorStorySaveAndPublish} from '../../store/editor.actions';
import {WindowToken} from '../../../../core/shared/helpers/window.helper';
import {EnvironmentToken} from '../../../../core/shared/helpers/environment.helper';
import {Environment} from '../../../../environments/environment';
import {ELEMENT_TYPES, ParagraphElement} from '../../shared/json-to-html';
import {EDITOR_STORY_PROPERTIES} from '../../shared/editor.story-properties';
import {EDITOR_STATUS, EditorState} from '../../store/editor.state';

@Component({
  selector: 'editor-comment-button',
  templateUrl: './comment-button.component.html',
  styleUrls: ['./comment-button.component.scss']
})
export class EditorCommentButtonComponent implements OnInit, OnDestroy {
  @HostBinding('class') public class = 'd-flex align-items-center mr-4';
  public story: Story;
  public saveStatus: EDITOR_STATUS;
  public isBodyEmpty = true;
  public canPublishComment = false;
  private editor$: Observable<EditorState>;
  private editorSub: Subscription;

  constructor(
    @Inject(WindowToken) private window,
    @Inject(EnvironmentToken) private environment: Environment,
    private store: Store<AppStates>,
    private toastr: ToastrService,
  ) {
    this.editor$ = this.store.select(selectEditorState);
  }

  public ngOnInit() {
    this.editorSub = this.editor$.subscribe((editorState: EditorState) => {
      this.story = editorState.story;
      this.saveStatus = editorState.status;
      this.setIsBodyEmpty();
      this.setCanPublishComment();

      if (this.saveStatus === EDITOR_STATUS.Published) {
        this.window.location.href = `${this.environment.clientUrl}${this.story.user.username}/${this.story.alias}`;
      }
    });
  }

  public onCommentClicked() {
    if (this.isBodyEmpty) {
      this.toastr.warning(
        `Write your comment to publish it`,
        `Nothing written yet!`,
        {positionClass: 'toast-bottom-right'}
        );
      return;
    }
    if (this.canPublishComment) {
      this.store.dispatch(
        new EditorStorySaveAndPublish(
          this.story,
          [EDITOR_STORY_PROPERTIES.BodyAndTitle]
        )
      );
    }
  }

  public setIsBodyEmpty() {
    this.isBodyEmpty = !this.story.bodyJSON ||
      (this.story.bodyJSON && this.story.bodyJSON.length === 0) ||
      (
        this.story.bodyJSON &&
        this.story.bodyJSON.length === 1 &&
        this.story.bodyJSON[0].type ===  ELEMENT_TYPES.Paragraph &&
        (
          (this.story.bodyJSON[0] as ParagraphElement).data.text === undefined ||
          (this.story.bodyJSON[0] as ParagraphElement).data.text === ''
        )
      );
  }

  public setCanPublishComment() {
    this.canPublishComment = this.saveStatus === EDITOR_STATUS.EditorLoaded ||
      this.saveStatus === EDITOR_STATUS.Saved ||
      this.saveStatus === EDITOR_STATUS.NotSaved;
  }

  public ngOnDestroy() {
    if (this.editorSub) {
      this.editorSub.unsubscribe();
    }
  }
}
