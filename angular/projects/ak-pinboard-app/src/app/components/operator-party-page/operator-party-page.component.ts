import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { orderBy } from 'lodash';
import { AppTitleService } from '../../services/app-title.service';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { Router } from '@angular/router';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { ReplaySubject, combineLatest, Observable } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { GameRegion } from 'projects/ak-pinboard-lib/src/lib/abstractions/game-data/game-region';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';
import { AppSettingsService } from '../../services/app-settings.service';
import { AppSettings } from '../../services/app-settings';
import * as html2canvas from 'html2canvas/dist/html2canvas.js';
import { format as formatDate } from 'date-fns';

const professions = ['PIONEER', 'WARRIOR', 'SNIPER', 'CASTER', 'TANK', 'MEDIC', 'SUPPORT', 'SPECIAL'];

interface CharasPerProfession {
  mains: AkCharacter[];
  subs: AkCharacter[];
  pristines: AkCharacter[];
  missing: AkCharacter[];
}

@Component({
  templateUrl: './operator-party-page.component.html',
  styleUrls: ['./operator-party-page.component.less']
})
export class OperatorPartyPageComponent implements OnInit, OnDestroy {

  public readonly professions = professions;
  public readonly settings$: Observable<AppSettings>;
  public readonly minLevel$: Observable<number>;
  public readonly minPhase$: Observable<number>;
  public classGroups: [string, CharasPerProfession][] = [];

  private readonly destroyed$: ReplaySubject<void> = new ReplaySubject(1);

  @ViewChild('rosterContainer', { static: true }) rosterContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router,
    private readonly region: GameRegionService,
    private readonly settingsService: AppSettingsService,
  ) {
    this.settings$ = settingsService.settings$;
    this.minLevel$ = this.settings$.pipe(map(x => x.highlightLevel));
    this.minPhase$ = this.settings$.pipe(map(x => x.highlightEvolvePhase));
  }

  getPhaseUrl(evolvePhase: number) {
    return `${AkAssetsRootUrl}/ui/ICON_ELITE/elite_${evolvePhase}.png`;
  }

  ngOnInit(): void {
    this.title.setPageTitle('Roster');

    combineLatest([
      this.region.language$,
      this.region.region$,
      this.settingsService.settings$,
      this.charaService.reloadCharas$
    ]).pipe(takeUntil(this.destroyed$))
      .subscribe(([l, r, s]) => {
        this.classGroups = this.computeGroups(this.charaService.charas, l, r, s);
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

  setMinPhase(x: number) {
    this.settingsService.updateSettings((s) => {
      s.highlightEvolvePhase = x;
    });
  }

  setMinLevel(x: number) {
    this.settingsService.updateSettings((s) => {
      s.highlightLevel = x;
    });
  }

  getClassImgUrl(p: string) {
    const className = p.toLowerCase();
    return `${AkAssetsRootUrl}/ui/ICON_PROFESSIONS_LARGE/icon_profession_${className}_large.png`;
  }

  computeGroups(chars: AkCharacter[], language: GameRegion, region: GameRegion, appSettings: AppSettings) {
    const groups: { [prof: string]: CharasPerProfession } = {};
    const minLevel = appSettings.highlightLevel;
    const minPhase = appSettings.highlightEvolvePhase;
    for (const c of chars) {
      const p = c.data.profession;
      if (!groups[p]) { groups[p] = { mains: [], subs: [], missing: [], pristines: [] }; }
      if (c.hired) {
        if (c.evolvePhase === 0 && c.level <= 1) {
          groups[p].pristines.push(c);
        } else if (c.evolvePhase > minPhase || (c.evolvePhase === minPhase && c.level >= minLevel)) {
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
        ['evolvePhase', 'level', 'data.rarity', 'tl.name'],
        ['desc', 'desc', 'desc', 'asc']
      );
      g.subs = orderBy(
        g.subs, // By level desc
        ['evolvePhase', 'level', 'data.rarity', 'tl.name'],
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

    // Sort by the order in professions
    return Object.entries(groups).sort(([pA, xA], [pB, xB]) => {
      const a = professions.indexOf(pA);
      const b = professions.indexOf(pB);

      return a - b;
    });
  }

  async snipSnip() {
    window.scrollTo(0, 0);
    const o = {
      allowTaint: true,
      useCORS: true,
      logging: false,
      backgroundColor: '#222222',
    };
    const canvas: HTMLCanvasElement = await html2canvas(this.rosterContainer.nativeElement, o);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = true;
    const dataUri = canvas.toDataURL('image/png');
    const blob = dataURItoBlob(dataUri);
    const filename = `arknights-roster_${formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`;

    const aElm = document.createElement('a');
    aElm.style.display = 'none';
    document.body.appendChild(aElm);
    aElm.href = window.URL.createObjectURL(blob);
    aElm.download = filename;

    aElm.click();

    window.URL.revokeObjectURL(aElm.href);
    aElm.parentElement.removeChild(aElm);
  }
}

function dataURItoBlob(dataURI: string) {
  let byteString: string;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = decodeURI(dataURI.split(',')[1]);
  }

  // separate out the mime component
  const mimeString: string = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  const blob: Uint8Array = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    blob[i] = byteString.charCodeAt(i);
  }
  return new Blob([blob], {
    type: mimeString
  });
}
