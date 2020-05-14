import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AkCharacter } from '../abstractions/character';
import { CharaData, CharacterTableFile } from '../abstractions/game-data/character-table';
import { GameDataConstFile } from '../abstractions/game-data/game-data-const';
import { GameDatabase } from '../abstractions/game-data/game-database';
import { SkinInfo } from '../abstractions/game-data/skin-table';
import { GameRegion } from '../abstractions/game-data/game-region';
import { CharaTranslation, CharaTranslations } from '../abstractions/tl-data';
import { AkhrCharaData } from '../abstractions/game-data/tl-akhr';
import { of } from 'rxjs';
import { UserDataService, applyUserData, createUserData } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class CharaRepositoryService {

  charas: AkCharacter[];
  charaMap: Map<string, AkCharacter>;
  skinMap: Map<string, SkinInfo>;
  buildinEvolveMap: { [charId: string]: { [phaseId: string]: string; }; }; /* char => phaseId => skinId */
  tlMap: Map<string, CharaTranslations>;

  constructor(
    private readonly userDataService: UserDataService
  ) {
    this.charaMap = new Map<string, AkCharacter>();
    this.skinMap = new Map<string, SkinInfo>();
    this.charas = [];
  }

  public init(db: GameDatabase) {
    // Clear collections
    this.skinMap.clear();
    this.charaMap.clear();
    this.charas.splice(0, this.charas.length);

    // Build translations
    this.tlMap = buildTranslations(db);

    // Add skins
    for (const skinId in db.skintable.charSkins) {
      if (db.skintable.charSkins.hasOwnProperty(skinId)) {
        this.skinMap.set(skinId, db.skintable.charSkins[skinId]);
      }
    }
    // Add elite-to-skin map
    this.buildinEvolveMap = db.skintable.buildinEvolveMap;

    // Map characters
    for (const charId in db.chars) {
      if (isChara(db.chars[charId])) {

        // Collect region data
        const regionData: { [region in GameRegion]?: CharaData } = {};
        if (charId in db.chars) {
          regionData.zh_CN = db.chars[charId];
        }
        if (charId in db.charsEN) {
          regionData.en_US = db.charsEN[charId];
        }
        if (charId in db.charsJP) {
          regionData.ja_JP = db.charsJP[charId];
        }
        if (charId in db.charsKR) {
          regionData.ko_KR = db.charsKR[charId];
        }

        const charaTranslations = this.tlMap.get(charId);

        // Create AkCharacter
        const c: AkCharacter = new AkCharacter(charId, regionData, charaTranslations, 'zh_CN', 'en_US');

        // Load userData
        applyUserData(c, this.userDataService.loadChara('000', charId));

        // These operators are always added
        if (db.dataconst.initCharIdList.indexOf(charId) >= 0) {
          c.hire();
        }

        // Compute current skin and stats
        this.updateCharaSkin(c);
        c.computeStats();

        this.charas.push(c);
        this.charaMap.set(charId, c);
      }
    }
  }

  public saveChara(c: AkCharacter) {
    this.userDataService.saveChara('000', c.charId, createUserData(c));
  }

  public updateCharaSkin(c: AkCharacter) {
    let skinInfo: SkinInfo;
    const skinEvolInfo = this.buildinEvolveMap[c.charId];

    if (c.skinId) {
      skinInfo = this.skinMap[c.skinId];
    } else {
      for (let evolvePhase = c.evolvePhase; evolvePhase > 0; evolvePhase--) {
        if (skinEvolInfo[evolvePhase]) {
          skinInfo = this.skinMap.get(skinEvolInfo[evolvePhase]);
          break;
        }
      }
    }

    if (!skinInfo) {
      // Default to Elite 0
      skinInfo = this.skinMap.get(skinEvolInfo[0]);
    }

    if (!skinInfo) {
      throw new Error(`No default skin for character ${c.charId}`);
    }
    c.setSkin(skinInfo);
  }
}

function isChara(c: CharaData) {
  return c.profession !== 'TOKEN'
    && c.profession !== 'TRAP';
}

function buildTranslations(db: GameDatabase): Map<string, CharaTranslations> {
  const m = new Map<string, CharaTranslations>();

  // Map tl-akhr by CN name
  const tlAkhr = new Map<string, AkhrCharaData>();
  db.chars2.forEach(c => tlAkhr.set(c.name_cn, c));

  // Build translations for all characters
  Object.entries(db.chars).forEach(([charId, cnCharData]) => {
    const tls: CharaTranslations = {
      zh_CN: buildCharaTranslation(cnCharData, charId, 'zh_CN', db.chars, tlAkhr),
      en_US: buildCharaTranslation(cnCharData, charId, 'en_US', db.charsEN, tlAkhr),
      ja_JP: buildCharaTranslation(cnCharData, charId, 'ja_JP', db.charsJP, tlAkhr),
      ko_KR: buildCharaTranslation(cnCharData, charId, 'ko_KR', db.charsKR, tlAkhr),
    };
    m.set(charId, tls);
  });
  return m;
}

function buildCharaTranslation(
  cnData: CharaData,
  charId: string,
  region: GameRegion,
  regionFile: CharacterTableFile,
  tlFile: Map<string, AkhrCharaData>
): CharaTranslation {
  // Use official name from region file if present
  if (charId in regionFile) {
    return {
      name: regionFile[charId].name,
      characteristic: regionFile[charId].description,
    };
  }

  // Default to CN name
  let name = cnData.name;
  let characteristic = cnData.description;

  // Use translated name from al-akhr.json
  if (tlFile.has(cnData.name)) {
    const tlData = tlFile.get(cnData.name);
    switch (region) {
      case 'en_US':
        if (tlData.name_en) { name = tlData.name_en; }
        if (tlData.characteristic_en) { characteristic = tlData.characteristic_en; }
        break;
      case 'ja_JP':
        if (tlData.name_jp) { name = tlData.name_jp; }
        if (tlData.characteristic_jp) { characteristic = tlData.characteristic_jp; }
        break;
      case 'ko_KR':
        if (tlData.name_kr) { name = tlData.name_kr; }
        if (tlData.characteristic_kr) { characteristic = tlData.characteristic_kr; }
        break;
    }
  } else {
    console.log(`Character not found in tl-akhr.json: ${cnData.name} (${charId})`);
  }
  return {
    name,
    characteristic,
  };
}
