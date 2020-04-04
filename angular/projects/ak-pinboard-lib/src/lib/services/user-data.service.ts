import { Injectable } from '@angular/core';
import { GameRegion } from '../abstractions/game-data/game-region';
import { AkCharacter } from '../abstractions/character';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {

  constructor() { }

  loadLanguage(): GameRegion {
    return localStorage.getItem('i18n_language') as GameRegion || 'en_US';
  }
  saveLanguage(l: GameRegion) {
    localStorage.setItem('i18n_language', l);
  }

  loadRegion(): GameRegion {
    return localStorage.getItem('i18n_region') as GameRegion || 'en_US';
  }
  saveRegion(r: GameRegion) {
    localStorage.setItem('i18n_region', r);
  }

  loadChara(saveSlot: string, charId: string): CharaUserData | null {
    const j = localStorage.getItem(`${saveSlot}__chara__${charId}`);
    if (j !== null && j !== undefined) {
      return JSON.parse(j);
    }
    return null;
  }
  saveChara(saveSlot: string, charId: string, x: CharaUserData) {
    const str = JSON.stringify(x);
    localStorage.setItem(`${saveSlot}__chara__${charId}`, str);
  }
}

export interface CharaUserData {
  level: number;
  trust: number;
  potential: number;
  skinId: string;
  phaseIdx: number;
  hired: boolean;
}

export function createUserData(c: AkCharacter) {
  return {
    level: c.level,
    trust: c.trust,
    potential: c.potential,
    skinId: c.skinId,
    phaseIdx: c.phaseIdx,
    hired: c.hired,
  };
}
export function applyUserData(c: AkCharacter, x: CharaUserData | null) {
  if (x !== null && x !== undefined) {
    c.level = x.level;
    c.trust = x.trust;
    c.potential = x.potential;
    c.skinId = x.skinId;
    c.phaseIdx = x.phaseIdx;
    c.hired = x.hired;
    // Call computeStats() and updateSkin() after loading
  }
}
