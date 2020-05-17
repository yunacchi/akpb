import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { AkCharacter } from '../../abstractions/character';
import { AkAssetsRootUrl, LocalAssetsRootUrl } from '../../abstractions/url';

@Component({
  selector: 'ak-character-card',
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss']
})
export class CharacterCardComponent implements OnInit {

  @Input() public chara: AkCharacter;
  @HostBinding('class.disabled') @Input() public disabled: boolean;
  @Input() public size: 'large' | 'small' = 'large';

  rarityRange: any[] = [];

  levelBgUrl = `${LocalAssetsRootUrl}/img/ui/chara/img_exp_empty_alpha.png`;

  @HostBinding('class.hired') public get isHired() {
    return this.chara && this.chara.hired;
  }
  @HostBinding('class.missing') public get isMissing() {
    return this.chara && !this.chara.hired;
  }
  @HostBinding('class.sz-large') public get isSizeLarge() {
    return this.size === 'large';
  }
  @HostBinding('class.sz-small') public get isSizeSmall() {
    return this.size === 'small';
  }

  get portraitUrl() {
    if (this.chara && this.chara.skinInfo) {
      return `${AkAssetsRootUrl}/img/portraits/${encodeURIComponent(this.chara.skinInfo.portraitId)}.png`;
    }
    return '';
  }

  get bannerUrl() {
    if (this.chara) {
      let rarity = this.chara.data.rarity + 1;
      if (rarity < 4) { rarity = 1; } // 1,2,3 use banner-1
      return `${AkAssetsRootUrl}/img/ui/chara/banner-${rarity}.png`;
    }
    return '';
  }

  get bgUrl() {
    if (this.chara) {
      let rarity = this.chara.data.rarity + 1;
      if (rarity < 4) { rarity = 1; } // 1,2,3 use bg-1
      return `${AkAssetsRootUrl}/img/ui/chara/bg-${rarity}.png`;
    }
    return '';
  }

  get glowUrl() {
    if (this.chara) {
      let rarity = this.chara.data.rarity + 1;
      return `${AkAssetsRootUrl}/img/ui/chara/glow-${rarity}.png`;
    }
    return '';
  }

  get headerUrl() {
    if (this.chara) {
      let rarity = this.chara.data.rarity + 1;
      return `${AkAssetsRootUrl}/img/ui/chara/header-${rarity}.png`;
    }
    return '';
  }

  get starUrl() {
    if (this.chara) {
      let rarity = this.chara.data.rarity + 1;
      return `${LocalAssetsRootUrl}/img/ui/chara/sprite_star_${rarity}.png`;
    }
    return '';
  }

  get classUrl() {
    if (this.chara) {
      let profession = this.chara.data.profession.toLowerCase();
      return `${LocalAssetsRootUrl}/img/ui/arts/misc/profession_icons_hub/icon_profession_${profession}.png`;
    }
    return '';
  }

  get phaseUrl() {
    if (this.chara) {
      return `${AkAssetsRootUrl}/img/ui/elite/${this.chara.evolvePhase}_s_box.png`;
    }
    return '';
  }

  constructor() { }

  ngOnInit(): void {
  }

}
