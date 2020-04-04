import { Component, OnInit } from '@angular/core';
import { AppTitleService } from '../../services/app-title.service';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { orderBy } from 'lodash';
import { Router } from '@angular/router';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-operator-list-page',
  templateUrl: './operator-list-page.component.html',
  styleUrls: ['./operator-list-page.component.scss']
})
export class OperatorListPageComponent implements OnInit {

  public readonly myOperators$: Observable<AkCharacter[]>;
  public readonly remainingOperators$: Observable<AkCharacter[]>;
  public readonly otherRegionOperators$: Observable<AkCharacter[]>;


  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router,
    private readonly regionService: GameRegionService
  ) {
    const locale$ = combineLatest([
      this.regionService.region$,
      this.regionService.language$
    ]);

    this.myOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => c.hired && c.regions.includes(region));
    }));

    this.remainingOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => !c.hired && c.regions.includes(region));
    }));

    this.otherRegionOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => !c.regions.includes(region));
    }));
  }

  buildOperatorArray(filter: (c: AkCharacter) => boolean) {
    return orderBy(
      this.charaService.charas.filter(filter),
      ['data.rarity', 'level', 'phaseIdx', 'tl.name'],
      ['desc', 'desc', 'desc', 'asc']
    );
  }

  ngOnInit(): void {
    this.title.setPageTitle('Operators');
  }

  onCharaClick(c: AkCharacter) {
    c.hire();
    this.router.navigate(['operators', c.charId]);
  }
}
