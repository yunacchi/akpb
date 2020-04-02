import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterTableFile, CharaData } from '../abstractions/character-table';
import { AkCharacter } from '../abstractions/character';
import { SkinTableFile, SkinInfo } from '../abstractions/skin-table';
import { GameDataConstFile } from '../abstractions/game-data-const';

const charaTableUrl = 'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/character_table.json';
const skinTableUrl = 'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/skin_table.json';
const gameDataUrl = 'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/json/gamedata/en_US/gamedata/excel/gamedata_const.json';

@Injectable({
  providedIn: 'root'
})
export class CharaRepositoryService {

  gameData: GameDataConstFile;
  charas: AkCharacter[];
  charaMap: Map<string, AkCharacter>;
  skinMap: Map<string, SkinInfo>;
  buildinEvolveMap: { [charId: string]: { [phaseId: string]: string; }; }; /* char => phaseId => skinId */

  constructor(
    private readonly http: HttpClient
  ) {
    this.charaMap = new Map<string, AkCharacter>();
    this.skinMap = new Map<string, SkinInfo>();
    this.charas = [];
  }

  public async loadCharacterDataAsync(): Promise<void> {
    // Clear collections
    this.skinMap.clear();
    this.charaMap.clear();
    this.charas.splice(0, this.charas.length);

    // Load game data constants
    this.gameData = await this.http.get<GameDataConstFile>(gameDataUrl).toPromise();

    // Load skin table
    const skinFile = await this.http.get<SkinTableFile>(skinTableUrl).toPromise();
    for (const skinId in skinFile.charSkins) {
      if (skinFile.charSkins.hasOwnProperty(skinId)) {
        this.skinMap.set(skinId, skinFile.charSkins[skinId]);
      }
    }
    this.buildinEvolveMap = skinFile.buildinEvolveMap;

    // Load character table
    const dataFile = await this.http.get<CharacterTableFile>(charaTableUrl).toPromise();

    // Map characters
    for (const charId in dataFile) {
      if (isCharaId(charId)) {

        // if(dataFile[charId].rarity > 2) dataFile[charId].rarity = 2;

        // Create AkCharacter
        const c: AkCharacter = new AkCharacter(charId, dataFile[charId]);

        if (this.gameData.initCharIdList.indexOf(charId) >= 0) {
          c.hire();
          console.log(c);
        }

        // c.setPhaseIdx(c.data.phases.length - 1);
        this.updateCharaSkin(c);
        c.computeStats();

        this.charas.push(c);
        this.charaMap.set(charId, c);
        // console.log(c);
      }
    }
  }

  public updateCharaSkin(c: AkCharacter) {
    let skinInfo: SkinInfo;
    const skinEvolInfo = this.buildinEvolveMap[c.charId];

    if (c.skinId) {
      skinInfo = this.skinMap[c.skinId];
    } else {
      for (let phaseIdx = c.phaseIdx; phaseIdx > 0; phaseIdx--) {
        if (skinEvolInfo[phaseIdx]) {
          skinInfo = this.skinMap.get(skinEvolInfo[phaseIdx]);
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

function isCharaId(charId: string) {
  return charId.startsWith('char_');
}
