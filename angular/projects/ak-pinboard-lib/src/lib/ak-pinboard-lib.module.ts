import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CharaRepositoryService } from './services/chara-repository.service';
import { CharacterCardComponent } from './components/character-card/character-card.component';
import { GameDataService } from './services/game-data.service';

@NgModule({
  declarations: [
    CharacterCardComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    CharacterCardComponent
  ],
  providers: [
    CharaRepositoryService,
    GameDataService
  ]
})
export class AkPinboardLibModule { }
