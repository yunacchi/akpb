import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { Observable } from 'rxjs';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';

@Component({
  selector: 'app-operator-detail-page',
  templateUrl: './operator-detail-page.component.html',
  styleUrls: ['./operator-detail-page.component.scss']
})
export class OperatorDetailPageComponent implements OnInit {
  public readonly char$: Observable<AkCharacter>;

  getAvatarUrl(c: AkCharacter) {
    return AkAssetsRootUrl + '/img/avatars/' + c.skinInfo.avatarId + '.png';
  }

  getPhaseUrl(phaseIdx: number) {
    return `${AkAssetsRootUrl}/img/ui/elite/${phaseIdx}.png`;
  }

  getIllustUrl(c: AkCharacter) {
    return AkAssetsRootUrl + '/img/characters/' + c.skinInfo.portraitId + '.png';
  }

  getPotentialUrl(p: number) {
    return AkAssetsRootUrl + '/img/ui/potential/' + (p + 1) + '.png';
  }

  constructor(
    private readonly charaService: CharaRepositoryService,
    route: ActivatedRoute
  ) {
    this.char$ = route.paramMap.pipe(
      map((params) => charaService.charaMap.get(params.get('charId')))
    );
  }

  ngOnInit(): void {
  }

  setPhaseIdx(c: AkCharacter, idxStr: number) {
    c.setPhaseIdx(idxStr);
    this.saveChara(c);
    this.charaService.updateCharaSkin(c);
  }

  setPotential(c: AkCharacter, x: number) {
    console.log(c);
    c.setPotential(x);
    this.saveChara(c);
  }

  saveChara(c: AkCharacter) {
    this.charaService.saveChara(c);
  }

}
