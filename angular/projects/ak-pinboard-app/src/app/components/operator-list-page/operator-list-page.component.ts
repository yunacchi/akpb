import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { orderBy } from 'lodash';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AppTitleService } from '../../services/app-title.service';
import { uniq } from 'lodash';

interface SortMode {
  asc: SortData;
  desc: SortData;
}
interface SortData {
  data: string[];
  order: boolean[];
}

type SortModeKey = 'rarity' | 'level';

const sortModes: { [key in SortModeKey]: SortMode } = {
  rarity: {
    asc: {
      data: ['data.rarity', 'evolvePhase', 'level', 'tl.name'],
      order: [true, true, true, true] // = isAscending
    },
    desc: {
      data: ['data.rarity', 'evolvePhase', 'level', 'tl.name'],
      order: [false, false, false, true] // = isAscending
    }
  },
  level: {
    asc: {
      data: ['evolvePhase', 'level', 'data.rarity', 'tl.name'],
      order: [true, true, true, true] // = isAscending
    },
    desc: {
      data: ['evolvePhase', 'level', 'data.rarity', 'tl.name'],
      order: [false, false, false, true] // = isAscending
    }
  }
};

@Component({
  selector: 'app-operator-list-page',
  templateUrl: './operator-list-page.component.html',
  styleUrls: ['./operator-list-page.component.less'],
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
export class OperatorListPageComponent implements OnInit, OnDestroy {

  public readonly myOperators$: Observable<AkCharacter[]>;
  public readonly remainingOperators$: Observable<AkCharacter[]>;
  public readonly otherRegionOperators$: Observable<AkCharacter[]>;
  public readonly destroy$: Subject<void> = new Subject<void>();
  public hoverChara?: AkCharacter;
  public nameFilter = '';
  public myOperatorsActive = true;
  public remainingOperatorsActive = true;
  public otherRegionOperatorsActive = false;

  public sortModeKey: SortModeKey = 'level';
  public sortAscending = false;

  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router,
    private readonly regionService: GameRegionService
  ) {
    const locale$ = combineLatest([
      this.regionService.region$,
      this.regionService.language$,
      this.charaService.reloadCharas$
    ]);

    this.myOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => filterName(c, this.nameFilter) && c.hired && c.regions.includes(region));
    }));

    this.remainingOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => filterName(c, this.nameFilter) && !c.hired && c.regions.includes(region));
    }));

    this.otherRegionOperators$ = locale$.pipe(map(([region, language]) => {
      return this.buildOperatorArray(c => filterName(c, this.nameFilter) && !c.regions.includes(region));
    }));
  }

  buildOperatorArray(filter: (c: AkCharacter) => boolean) {
    const p = uniq(
      this.charaService.charas.map(c => c.data.profession)
    );

    const sortData = this.sortAscending ? sortModes[this.sortModeKey].asc : sortModes[this.sortModeKey].desc;
    return orderBy(
      this.charaService.charas.filter(filter),
      sortData.data,
      sortData.order.map((isAsc) => isAsc ? 'asc' : 'desc')
    );
  }

  ngOnInit(): void {
    this.title.setPageTitle('Operators');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addChara(c: AkCharacter) {
    c.hire();
    this.charaService.saveChara(c);
    this.reload();
  }

  reload() {
    this.charaService.reloadCharas$.next();
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

function filterName(c: AkCharacter, nameFilter: string): boolean {
  if (nameFilter !== '') {
    const filter = nameFilter.trim().toLowerCase();
    const name = c.tl.name.trim().toLowerCase();
    return name.indexOf(filter) !== -1;
  }
  return true;
}
