import { Injectable } from '@angular/core';
import { GameRegion } from '../abstractions/game-data/game-region';
import { AkCharacter } from '../abstractions/character';

function createSyncChars(chars: CharaUserData[]) {
  const d: any = {};

  for (let i = 0; i < chars.length; i++) {
    const instId = i + 1;
    d[instId] = { instId, ...chars[i] };
  }

  return d;
}

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

  loadSettings<T>(defaultSettings: T) {
    const j = localStorage.getItem(`app_settings`);
    defaultSettings = JSON.parse(JSON.stringify(defaultSettings)); // Dumb copy
    if (j !== null && j !== undefined) {
      return { ...defaultSettings, ...JSON.parse(j) };
    }
    return defaultSettings;
  }
  saveSettings<T>(newSettings: T) {
    const str = JSON.stringify(newSettings);
    localStorage.setItem('app_settings', str);
  }

  loadChara(saveSlot: string, charId: string): CharaUserData | null {
    const j = localStorage.getItem(`${saveSlot}__chara__${charId}`);
    if (j !== null && j !== undefined) {
      return { charId, ...JSON.parse(j) };
    }
    return null;
  }
  saveChara(saveSlot: string, charId: string, x: CharaUserData) {
    const str = JSON.stringify(x);
    localStorage.setItem(`${saveSlot}__chara__${charId}`, str);
  }

  exportData(chars: CharaUserData[]) {
    // Same format as POST /account/syncData
    return {
      user: {
        troop: {
          chars: {
            ...createSyncChars(chars)
          }
        }
      }
    };
  }

  readImportData(d: any): CharaUserData[] {
    if (d && d.user && d.user.troop && d.user.troop.chars) {
      return Object.values(d.user.troop.chars);
    }
    return null;
  }
}

export interface CharaUserData {
  // instId: number;
  charId: string; // Not present in old data (is key)
  potentialRank: number;
  // mainSkillLvl: number;
  skin: string;
  level: number;
  // exp: number;
  evolvePhase: number;
  defaultSkillIndex: number;
  // defaultSkillIndex: number;
  // gainTime: number;
  // skills: any[];
  favorPoint?: number; // syncData only - Converted to trustPct on load

  hired?: boolean; // Custom only; Adds it to My Operators
  trustPct?: number; // Custom only

  trust?: number; // Old data
  potential?: number; // Old data
  phaseIdx?: number; // Old data
}

export function createUserData(c: AkCharacter): CharaUserData {
  return {
    level: c.level,
    trustPct: c.trustPct,
    potentialRank: c.potentialRank,
    skin: c.overrideSkinId,
    evolvePhase: c.evolvePhase,
    hired: c.hired,
    charId: c.charId,
    defaultSkillIndex: c.defaultSkillIndex,
  };
}
export function applyUserData(c: AkCharacter, x: CharaUserData | null) {
  if (x !== null && x !== undefined) {
    c.level = x.level;
    c.trustPct = x.trustPct || x.trust || 0;
    c.potentialRank = x.potentialRank || x.potential || 0;
    c.defaultSkillIndex = x.defaultSkillIndex || 0;

    if (!x.skin) {
      c.overrideSkinId = undefined;
    } else {
      c.overrideSkinId = x.skin;
    }
    c.evolvePhase = x.evolvePhase || x.phaseIdx || 0;
    c.phase = c.data.phases[c.evolvePhase];
    c.hired = x.hired;

    // Are we *actually* reading a syncData dump?
    if (x.favorPoint !== undefined) {
      // Convert favorPoints to trustPct
      c.trustPct = Math.round(favorPointsToTrustPct(x.favorPoint));
    }
    if (x.hired === undefined) {
      // Mark as hired (if it's in the syncData, the user has it)
      c.hired = true;
    }
    // Call computeStats() and updateSkin() after loading
  }
}

function favorPointsToTrustPct(favorPoints: number): number {
  // TODO: Actually find the formula? This is extrapolated from Excel and I don't have a Mathematica on hand.
  if (favorPoints < 2700) {
    return 0.4223 * Math.pow(favorPoints, 0.605);
  }
  return 0.0065 * favorPoints + 33.729;
}
