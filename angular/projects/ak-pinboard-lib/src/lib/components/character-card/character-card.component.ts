import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { AkCharacter } from '../../abstractions/character';
import { AkAssetsRootUrl, LocalAssetsRootUrl } from '../../abstractions/url';

@Component({
  selector: 'ak-character-card',
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.less']
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
      return `${AkAssetsRootUrl}/arts/portraits/${encodeURIComponent(this.chara.skinInfo.portraitId)}.png`;
    }
    return '';
  }

  get bannerUrl() {
    if (this.chara) {
      const rarity = this.chara.data.rarity + 1;
      let filename = `sprite_lowerhub${rarity}shadowoff`;
      if (rarity < 4) {
        filename = `sprite_lowerhub1_3shadowoff`;
      }
      return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/${filename}.png`;
    }
    return '';
  }

  get bgUrl() {
    if (this.chara) {
      const rarity = this.chara.data.rarity + 1;
      let filename = `sprite_char_background${rarity}`;
      if (rarity < 4) {
        filename = `sprite_char_background1_3`;
      }
      if (rarity > 4) {
        // For some reason, filenames go 1_3, then 4, then 6, 7. There's no sprite_char_background5. :(
        filename = `sprite_char_background${rarity + 1}`;
      }
      return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/${filename}.png`;
    }
    return '';
  }

  get glowUrl() {
    if (this.chara) {
      const rarity = this.chara.data.rarity + 1;
      return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/sprite_rartylight_${rarity}.png`;
    }
    return '';
  }

  get headerUrl() {
    if (this.chara) {
      const rarity = this.chara.data.rarity + 1;
      return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/sprite_upperhub_${rarity}.png`;
    }
    return '';
  }

  get starUrl() {
    if (this.chara) {
      const rarity = this.chara.data.rarity + 1;
      return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/sprite_star_${rarity}.png`;
    }
    return '';
  }

  get classUrl() {
    if (this.chara) {
      const profession = this.chara.data.profession.toLowerCase();
      return `${AkAssetsRootUrl}/ui/ICON_PROFESSIONS/icon_profession_${profession}.png`;
    }
    return '';
  }

  get phaseUrl() {
    if (this.chara) {
      return `${AkAssetsRootUrl}/ui/ICON_ELITE/elite_${this.chara.evolvePhase}_card.png`;
    }
    return '';
  }

  get potentialUrl() {
    if (this.chara) {
      return `${AkAssetsRootUrl}/ui/ICON_POTENTIAL/potential_${this.chara.potentialRank}_small.png`;
    }
    return '';
  }

  get bkgPotentialUrl() {
    return `${AkAssetsRootUrl}/ui/UI_CHARACTER_CARD_GROUP/bkg_potential.png`;
  }

  get skillUrl() {
    if (this.chara && this.chara.defaultSkillInfo) {
      const s = this.chara.defaultSkillInfo.iconId || this.chara.defaultSkillInfo.skillId;
      if (s) {
        return AkAssetsRootUrl + `/ui/SKILL_ICONS/skill_icon_${encodeURIComponent(s)}.png`;
      }
    }
    return '';
  }

  constructor() { }

  ngOnInit(): void {
  }

}
