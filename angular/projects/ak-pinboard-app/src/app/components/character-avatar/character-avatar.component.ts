import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { AkAssetsRootUrl } from 'projects/ak-pinboard-lib/src/lib/abstractions/url';

@Component({
  selector: 'ak-character-avatar',
  templateUrl: './character-avatar.component.html',
  styleUrls: ['./character-avatar.component.less']
})
export class CharacterAvatarComponent implements OnInit {

  @Input() public chara: AkCharacter;
  @HostBinding('class.disabled') @Input() public disabled: boolean;

  @HostBinding('class.rarity-0') public get isRarity0() {
    return this.chara && this.chara.data.rarity === 0;
  }
  @HostBinding('class.rarity-1') public get isRarity1() {
    return this.chara && this.chara.data.rarity === 1;
  }
  @HostBinding('class.rarity-2') public get isRarity2() {
    return this.chara && this.chara.data.rarity === 2;
  }
  @HostBinding('class.rarity-3') public get isRarity3() {
    return this.chara && this.chara.data.rarity === 3;
  }
  @HostBinding('class.rarity-4') public get isRarity4() {
    return this.chara && this.chara.data.rarity === 4;
  }
  @HostBinding('class.rarity-5') public get isRarity5() {
    return this.chara && this.chara.data.rarity === 5;
  }

  constructor() { }

  ngOnInit(): void {
  }

  get avatarUrl() {
    if (this.chara && this.chara.skinInfo) {
      return `${AkAssetsRootUrl}/arts/avatars/${encodeURIComponent(this.chara.skinInfo.avatarId)}.png`;
    }
    return '';
  }

  get name() {
    if (this.chara && this.chara.skinInfo) {
      return this.chara.tl.name.toUpperCase();
    }
    return '';
  }
}
