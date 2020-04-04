import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { orderBy } from 'lodash';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppTitleService } from '../../services/app-title.service';

@Component({
  selector: 'app-operator-list-page',
  templateUrl: './operator-list-page.component.html',
  styleUrls: ['./operator-list-page.component.scss'],
  animations: [
    trigger('cardOverlayShowHide', [
      state('show', style({
        opacity: 1,
        height: '*'
      })),
      state('hide', style({
        opacity: 0,
        height: 0
      })),
      transition('hide => show', [
        style({ height: '*' }),
        animate('140ms ease-in-out', style({
          opacity: 1
        }))
      ]),
      transition('show => hide', [
        animate('140ms ease-in-out', style({
          opacity: 0
        }))
      ]),
    ]),
  ],
})
export class OperatorListPageComponent implements OnInit {

  public readonly myOperators$: Observable<AkCharacter[]>;
  public readonly remainingOperators$: Observable<AkCharacter[]>;
  public readonly otherRegionOperators$: Observable<AkCharacter[]>;
  public readonly reload$: BehaviorSubject<undefined>;
  public hoverChara?: AkCharacter;

  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router,
    private readonly regionService: GameRegionService
  ) {
    this.reload$ = new BehaviorSubject<undefined>(undefined);
    const locale$ = combineLatest([
      this.regionService.region$,
      this.regionService.language$,
      this.reload$
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

  addChara(c: AkCharacter) {
    c.hire();
    this.charaService.saveChara(c);
    this.reload$.next(undefined);
  }

  onCharaMouseEnter(c: AkCharacter) {
    this.hoverChara = c;
  }
  onCharaMouseLeave(c: AkCharacter) {
    if (this.hoverChara === c) {
      this.hoverChara = undefined;
    }
  }
}
