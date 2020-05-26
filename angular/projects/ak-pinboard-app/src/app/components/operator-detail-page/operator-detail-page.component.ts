import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map, first, takeUntil } from 'rxjs/operators';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { Observable, ReplaySubject, combineLatest } from 'rxjs';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';
import { AppTitleService } from '../../services/app-title.service';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { SkinInfo } from 'projects/ak-pinboard-lib/src/lib/abstractions/game-data/skin-table';

@Component({
  selector: 'app-operator-detail-page',
  templateUrl: './operator-detail-page.component.html',
  styleUrls: ['./operator-detail-page.component.less']
})
export class OperatorDetailPageComponent implements OnInit, OnDestroy {
  private readonly destroyed$: ReplaySubject<void> = new ReplaySubject(1);
  public readonly char$: Observable<AkCharacter>;

  getAvatarUrl(c: AkCharacter) {
    return AkAssetsRootUrl + '/arts/avatars/' + encodeURIComponent(c.skinInfo.avatarId) + '.png';
  }

  getIllustUrl(c: AkCharacter) {
    return AkAssetsRootUrl + '/arts/characters/' + encodeURIComponent(c.skinInfo.portraitId) + '.png';
  }

  getPotentialUrl(p: number) {
    return AkAssetsRootUrl + `/ui/ICON_POTENTIAL/potential_${p}_small.png`;
  }

  getPhaseUrl(evolvePhase: number) {
    return `${AkAssetsRootUrl}/ui/ICON_ELITE/elite_${evolvePhase}.png`;
  }

  getSkins(c: AkCharacter) {
    return Array.from(this.charaService.skinMap.values()).filter(s => s.charId === c.charId);
  }

  getSkinImg(s: SkinInfo) {
    const skinGroupId = s.displaySkin.skinGroupId;
    if (skinGroupId === 'ILLUST_0') {
      return this.getPhaseUrl(0);
    }
    if (skinGroupId === 'ILLUST_1') {
      return this.getPhaseUrl(1);
    }
    if (skinGroupId === 'ILLUST_2') {
      return this.getPhaseUrl(2);
    }
    if (skinGroupId === 'ILLUST_3') {
      return this.getPhaseUrl(3);
    }
    return AkAssetsRootUrl + `/ui/SKIN_GROUP_ICON/${encodeURIComponent(s.displaySkin.skinGroupId)}.png`;
  }

  constructor(
    private readonly charaService: CharaRepositoryService,
    private readonly region: GameRegionService,
    private readonly title: AppTitleService,
    route: ActivatedRoute
  ) {
    this.char$ = route.paramMap.pipe(
      map((params) => charaService.charaMap.get(params.get('charId')))
    );
  }
  ngOnInit(): void {
    combineLatest([
      this.char$,
      this.region.language$
    ]).pipe(takeUntil(this.destroyed$))
      .subscribe(([c, l]) => {
        this.title.setPageTitle(c.tl.name);
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  setEvolvePhase(c: AkCharacter, idxStr: number) {
    c.setEvolvePhase(idxStr);
    this.saveChara(c);
    this.charaService.updateCharaSkin(c);
  }

  setPotential(c: AkCharacter, x: number) {
    c.setPotential(x);
    this.saveChara(c);
  }

  saveChara(c: AkCharacter) {
    this.charaService.saveChara(c);
  }

  hire(c: AkCharacter) {
    c.hire();
    this.saveChara(c);
  }

  fire(c: AkCharacter) {
    c.fire();
    this.saveChara(c);
  }

  setSkin(c: AkCharacter, skinId?: string) {
    if (skinId) {
      c.overrideSkinId = skinId;
    } else {
      c.overrideSkinId = undefined;
    }
    this.charaService.updateCharaSkin(c);
    this.saveChara(c);
  }
}
