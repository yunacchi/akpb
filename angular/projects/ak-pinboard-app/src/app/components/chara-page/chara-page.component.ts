import { Component, OnInit } from '@angular/core';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';

@Component({
  selector: 'app-chara-page',
  templateUrl: './chara-page.component.html',
  styleUrls: ['./chara-page.component.scss']
})
export class CharaPageComponent implements OnInit {
  charas: AkCharacter[];
  selectedChara?: AkCharacter;

  constructor(
    private readonly charaService: CharaRepositoryService
  ) { }

  ngOnInit(): void {
    this.charas = [...this.charaService.charas]; // Copy array for in-place sorting
    this.sortCharas();
  }

  getAvatarUrl(c: AkCharacter) {
    return AkAssetsRootUrl + '/img/avatars/' + c.skinInfo.avatarId + '.png';
  }

  getPhaseUrl(phaseIdx: number) {
    return `${AkAssetsRootUrl}/img/ui/elite/${phaseIdx}.png`;
  }

  get canRemoveChara() {
    return this.selectedChara
      && this.selectedChara.hired
      && this.selectedChara.charId !== 'char_002_amiya';
  }

  fireSelectedChara() {
    if(this.selectedChara) {
      this.selectedChara.fire();
      this.selectedChara = undefined;
      this.sortCharas();
    }
  }

  sortCharas() {
    this.charas.sort((a, b) => {
      if (a.hired !== b.hired) {
        if (a.hired) { return -1; }
        return 1;
      }

      if (a.data.rarity !== b.data.rarity) {
        if (b.data.rarity > a.data.rarity) { return -1; }
        return 1;
      }
    });
  }

  selectChara(c?: AkCharacter) {
    this.selectedChara = c;
    if(c && !c.hired) {
      c.hire();
      this.sortCharas();
    }
  }

  updateCharaSkin() {
    if(this.selectedChara) {
      this.charaService.updateCharaSkin(this.selectedChara);
    }
  }

}
