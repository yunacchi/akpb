import { Component } from '@angular/core';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public keepObjectOrder = (a, b) => a.key;

  constructor(
    public regionService: GameRegionService
  ) {
  }
}
