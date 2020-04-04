import { Injectable } from '@angular/core';
import { GameRegion } from '../abstractions/game-data/game-region';
import { CharaRepositoryService } from './chara-repository.service';
import { BehaviorSubject } from 'rxjs';
import { UserDataService } from './user-data.service';

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

  public readonly region$: BehaviorSubject<GameRegion>;
  public readonly language$: BehaviorSubject<GameRegion>;

  constructor(
    private readonly charaRepo: CharaRepositoryService,
    private readonly userDataService: UserDataService
  ) {
    this.region$ = new BehaviorSubject<GameRegion>(this.userDataService.loadRegion());
    this.language$ = new BehaviorSubject<GameRegion>(this.userDataService.loadLanguage());
  }

  setRegion(newRegion: GameRegion) {
    console.log(`Setting region: ${newRegion}`);
    this.charaRepo.charas.forEach(c => c.setRegion(newRegion));
    this.userDataService.saveRegion(newRegion);
    this.region$.next(newRegion);
  }

  setLanguage(newLanguage: GameRegion) {
    console.log(`Setting language: ${newLanguage}`);
    this.charaRepo.charas.forEach(c => c.setLanguage(newLanguage));
    this.userDataService.saveLanguage(newLanguage);
    this.language$.next(newLanguage);
  }
}
