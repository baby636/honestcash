import {Component, Input, OnInit} from '@angular/core';
import Story from '../../models/story';
import {Unlock} from '../../models/unlock';

@Component({
  selector: 'main-story-unlocks',
  templateUrl: './story-unlocks.component.html',
  styleUrls: ['./story-unlocks.component.scss']
})
export class MainStoryUnlocksComponent{
  @Input() public story: Story;
  @Input() public unlocks: Unlock[];
  public isCollapsed = true;
}
