import {Component, ElementRef, Input, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import Post from '../../../../shared/models/post';
import {Store} from '@ngrx/store';
import {AppStates, selectEditorState} from '../../../../app.states';
import {Observable, Subscription} from 'rxjs';
import {EDITOR_STATUS, State as EditorState} from '../../../../store/editor/editor.state';
import {Block, convertBlockToHtml} from '../../converters/json-to-html';
import {NgForm} from '@angular/forms';
import {EditorStoryPropertyChange} from '../../../../store/editor/editor.actions';
import {STORY_PROPERTIES} from '../../services/editor.service';

export enum LINEBREAK_ACTION {
  MoveUp = 'MOVE_UP',
  MoveDown = 'MOVE_DOWN',
}

@Component({
  selector: 'editor-paid-section-selection',
  templateUrl: './paid-section-selection.component.html',
  styleUrls: ['./paid-section-selection.component.scss'],
})
export class EditorPaidSectionSelectionComponent implements OnInit, OnDestroy {
  @Input() form: NgForm;
  @ViewChildren('paidSectionElements') paidSectionElements: QueryList<ElementRef>;
  public LINEBREAK_ACTION = LINEBREAK_ACTION;
  public isLoaded: boolean;
  public paidSectionLineBreakTouched = false;
  public paidSectionLinebreakEnd: number;
  public story: Post;
  private editorStateObservable: Observable<EditorState>;
  private editorState$: Subscription;

  constructor(
    private store: Store<AppStates>,
  ) {
    this.editorStateObservable = this.store.select(selectEditorState);
  }

  ngOnInit() {
    this.editorState$ = this.editorStateObservable
    .subscribe((editorState: EditorState) => {
      this.isLoaded = editorState.isLoaded;
      this.story = editorState.story;

      if (editorState.status === EDITOR_STATUS.Loaded) {
        if (!this.story.paidSectionLinebreak) {
          this.story.paidSectionLinebreak = 0;
        }
        if (!this.story.paidSectionCost) {
          this.story.paidSectionCost = 0.001;
        }
        this.paidSectionLinebreakEnd = ((<number>(<Block[]>this.story.bodyJSON).length) - 1);
      }
    });
  }

  onSwitchLinebreak(action: LINEBREAK_ACTION) {
    this.paidSectionLineBreakTouched = true;
    console.log('story', this.story, this.paidSectionLinebreakEnd);
    let element: ElementRef;
    switch (action) {
      case LINEBREAK_ACTION.MoveUp: {
        if (this.story.paidSectionLinebreak > 0) {
          this.story.paidSectionLinebreak--;
          element = this.getPaidSectionBlockElementByLinebreak();
        }
        break;
      }
      case LINEBREAK_ACTION.MoveDown: {
        if (this.story.paidSectionLinebreak < this.paidSectionLinebreakEnd) {
          this.story.paidSectionLinebreak++;
          element = this.getPaidSectionBlockElementByLinebreak();
        }
        break;
      }
    }
    element.nativeElement.scrollIntoView({behavior: 'smooth'});
    this.store.dispatch(
      new EditorStoryPropertyChange(
        {property: STORY_PROPERTIES.PaidSectionLinebreak, value: this.story.paidSectionLinebreak}
      )
    );
  }

  onChangePaidSectionCost() {
    this.store.dispatch(
      new EditorStoryPropertyChange(
        {property: STORY_PROPERTIES.PaidSectionCost, value: this.story.paidSectionCost}
      )
    );
  }

  ngOnDestroy() {
    if (this.editorState$) {
      this.editorState$.unsubscribe();
    }
  }

  private convertBlockToHtml(block: Block) {
    return convertBlockToHtml(block);
  }

  private getPaidSectionBlockElementByLinebreak() {
    return this.paidSectionElements.find((el, index) => index === this.story.paidSectionLinebreak);
  }
}
