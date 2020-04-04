import { Injectable } from '@angular/core';
import { GameRegion } from '../abstractions/game-data/game-region';
import { CharaRepositoryService } from './chara-repository.service';

@Injectable({
  providedIn: 'root'
})
export class GameRegionService {

  public readonly regions: { [key in GameRegion]: string } = {
    zh_CN: '中文',
    en_US: 'Global',
    ja_JP: '日本語',
    ko_KR: '韓国語'
  };

  public readonly languages: { [key in GameRegion]: string } = {
    zh_CN: '中文',
    en_US: 'English',
    ja_JP: '日本語',
    ko_KR: '韓国語'
  };

  public region: GameRegion;
  public language: GameRegion;

  constructor(
    private readonly charaRepo: CharaRepositoryService
  ) {
    this.region = 'en_US';
    this.language = 'en_US';
  }

  setRegion(newRegion: GameRegion) {
    this.region = newRegion;
    this.charaRepo.charas.forEach(c => c.setRegion(newRegion));
  }

  setLanguage(newLanguage: GameRegion) {
    this.language = newLanguage;
    this.charaRepo.charas.forEach(c => c.setLanguage(newLanguage));
  }
}
