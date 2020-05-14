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
  favorPoint: number;
  potentialRank: number;
  skinId: string;
  evolvePhase: number;
  hired: boolean;

  trust?: number; // Old data
  potential?: number; // Old data
  phaseIdx?: number; // Old data
}

export function createUserData(c: AkCharacter) {
  return {
    level: c.level,
    favorPoint: c.favorPoint,
    potentialRank: c.potentialRank,
    skinId: c.skinId,
    evolvePhase: c.evolvePhase,
    hired: c.hired,
  };
}
export function applyUserData(c: AkCharacter, x: CharaUserData | null) {
  if (x !== null && x !== undefined) {
    c.level = x.level;
    c.favorPoint = x.favorPoint || x.trust;
    c.potentialRank = x.potentialRank || x.potential;
    c.skinId = x.skinId;
    c.evolvePhase = x.evolvePhase || x.phaseIdx;
    c.hired = x.hired;
    // Call computeStats() and updateSkin() after loading
  }
}
