import { Component, OnInit, OnDestroy } from '@angular/core';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { orderBy } from 'lodash';
import { AppTitleService } from '../../services/app-title.service';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { Router } from '@angular/router';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { ReplaySubject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GameRegion } from 'projects/ak-pinboard-lib/src/lib/abstractions/game-data/game-region';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';

const professions = ['MEDIC', 'WARRIOR', 'PIONEER', 'TANK', 'SNIPER', 'CASTER', 'SUPPORT', 'SPECIAL'];

interface CharasPerProfession {
  mains: AkCharacter[];
  subs: AkCharacter[];
  pristines: AkCharacter[];
  missing: AkCharacter[];
}

@Component({
  templateUrl: './operator-party-page.component.html',
  styleUrls: ['./operator-party-page.component.scss']
})
export class OperatorPartyPageComponent implements OnInit, OnDestroy {

  public professions = professions;
  public minPhase = 1; // Elite 1
  public minLevel = 40; // lv 40
  public classGroups: [string, CharasPerProfession][] = [];
  private readonly destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router,
    private readonly region: GameRegionService
  ) { }

  ngOnInit(): void {
    this.title.setPageTitle('Roster');

    combineLatest([
      this.region.language$,
      this.region.region$
    ]).pipe(takeUntil(this.destroyed$))
      .subscribe(([l, r]) => {
        this.classGroups = this.computeGroups(this.charaService.charas, l, r);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  getProfessionTl(p: string) {
    switch (p) {
      case 'MEDIC': return 'Medic';
      case 'WARRIOR': return 'Guard';
      case 'PIONEER': return 'Vanguard';
      case 'TANK': return 'Defender';
      case 'SNIPER': return 'Sniper';
      case 'CASTER': return 'Caster';
      case 'SUPPORT': return 'Supporter';
      case 'SPECIAL': return 'Specialist';
    }
    return p;
  }

  getClassImgUrl(p: string) {
    let className = 'vanguard';
    switch (p) {
      case 'MEDIC': className = 'medic'; break;
      case 'WARRIOR': className = 'guard'; break;
      case 'PIONEER': className = 'vanguard'; break;
      case 'TANK': className = 'defender'; break;
      case 'SNIPER': className = 'sniper'; break;
      case 'CASTER': className = 'caster'; break;
      case 'SUPPORT': className = 'supporter'; break;
      case 'SPECIAL': className = 'specialist'; break;
    }
    return `${AkAssetsRootUrl}/img/classes/black/icon_profession_${className}_large.png`;
  }

  computeGroups(chars: AkCharacter[], language: GameRegion, region: GameRegion) {
    const groups: { [prof: string]: CharasPerProfession } = {};
    for (const c of chars) {
      const p = c.data.profession;
      if (!groups[p]) { groups[p] = { mains: [], subs: [], missing: [], pristines: [] }; }
      if (c.hired) {
        if (c.phaseIdx === 0 && c.level <= 1) {
          groups[p].pristines.push(c);
        } else if (c.phaseIdx > this.minPhase || (c.phaseIdx === this.minPhase && c.level >= this.minLevel)) {
          groups[p].mains.push(c);
        } else {
          groups[p].subs.push(c);
        }
      } else {
        if (c.regions.includes(region)) {
          groups[p].missing.push(c);
        }
      }
    }

    // Sort results
    for (const g of Object.values(groups)) {
      g.mains = orderBy(
        g.mains, // By level desc
        ['phaseIdx', 'level', 'data.rarity', 'tl.name'],
        ['desc', 'desc', 'desc', 'asc']
      );
      g.subs = orderBy(
        g.subs, // By level desc
        ['phaseIdx', 'level', 'data.rarity', 'tl.name'],
        ['desc', 'desc', 'desc', 'asc']
      );
      g.pristines = orderBy(
        g.pristines, // By rarity desc
        ['data.rarity', 'tl.name'],
        ['desc', 'asc']
      );
      g.missing = orderBy(
        g.missing, // By rarity desc
        ['data.rarity', 'tl.name'],
        ['desc', 'asc']
      );
    }

    return Object.entries(groups);
  }

}