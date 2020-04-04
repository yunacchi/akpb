import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { CharaRepositoryService } from './chara-repository.service';
import { GameDatabase } from '../abstractions/game-data/game-database';

const gameDataUrlRoot = 'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master/';
const jsonList = {
  // CN
  chars           : 'json/gamedata/zh_CN/gamedata/excel/character_table.json',
  charword        : 'json/gamedata/zh_CN/gamedata/excel/charword_table.json',
  build           : 'json/gamedata/zh_CN/gamedata/excel/building_data.json',
  handbookInfo    : 'json/gamedata/zh_CN/gamedata/excel/handbook_info_table.json',
  range           : 'json/gamedata/zh_CN/gamedata/excel/range_table.json',
  skills          : 'json/gamedata/zh_CN/gamedata/excel/skill_table.json',
  skintable       : 'json/gamedata/zh_CN/gamedata/excel/skin_table.json',
  dataconst       : 'json/gamedata/zh_CN/gamedata/excel/gamedata_const.json',
  item_table      : 'json/gamedata/zh_CN/gamedata/excel/item_table.json',

  // EN
  charsEN         : 'json/gamedata/en_US/gamedata/excel/character_table.json',
  handbookInfoEN  : 'json/gamedata/en_US/gamedata/excel/handbook_info_table.json',
  charwordEN      : 'json/gamedata/en_US/gamedata/excel/charword_table.json',
  skillsEN        : 'json/gamedata/en_US/gamedata/excel/skill_table.json',

  // JP
  charsJP         : 'json/gamedata/ja_JP/gamedata/excel/character_table.json',

  // KR
  charsKR         : 'json/gamedata/ko_KR/gamedata/excel/character_table.json',

  // Utilities
  attacktype      : 'json/tl-attacktype.json',
  animlist        : 'json/ace/animlist.json',
  effect          : 'json/tl-effect.json',
  subclass        : 'json/subclass.json',

  // TL
  voicelineTL     : 'json/tl-voiceline.json',
  campdata        : 'json/tl-campdata.json',
  charastoryTL    : 'json/tl-charastory.json',
  storytextTL     : 'json/tl-storytext.json',
  vaTL            : 'json/tl-va.json',
  potentialTL     : 'json/tl-potential.json',
  unreadNameTL    : 'json/tl-unreadablename.json',
  itemstl         : 'json/tl-item.json',
  tags            : 'json/tl-tags.json',
  classes         : 'json/tl-type.json',
  chars2          : 'json/tl-akhr.json',
  gender          : 'json/tl-gender.json',
  ktags           : 'json/tl-tags-key.json',

  // jet TL
  riic            : 'json/ace/riic.json',
  talentsTL       : 'json/ace/tl-talents.json',
  skillsTL        : 'json/ace/tl-skills.json'
};

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly charaRepo: CharaRepositoryService
  ) { }

  public db?: GameDatabase;

  public loadGameData$() {
    const db: any = {};
    const observables = Object.entries(jsonList).map(([dataName, relativeUrl]) => {
      return this.httpClient.get(gameDataUrlRoot + relativeUrl)
        .pipe(
          tap((data) => { db[dataName] = data; })
        );
    });

    return forkJoin(observables)
      .pipe(
        tap(_ => {
          this.db = db;
          this.charaRepo.init(db);
        }),
        map(_ => this.db)
      );
  }
}
