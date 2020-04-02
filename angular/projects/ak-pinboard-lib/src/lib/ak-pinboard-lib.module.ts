import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CharaRepositoryService } from './services/chara-repository.service';
import { CharacterCardComponent } from './components/character-card/character-card.component';

export function initModuleAsync(charaRepo: CharaRepositoryService): () => Promise<any> {
  // tslint:disable-next-line: only-arrow-functions
  return function() { return charaRepo.loadCharacterDataAsync(); };
}

@NgModule({
  declarations: [
  CharacterCardComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
  CharacterCardComponent],
  providers: [
    CharaRepositoryService,
    {
      provide: APP_INITIALIZER, multi: true,
      useFactory: initModuleAsync,
      deps: [CharaRepositoryService]
    },
  ]
})
export class AkPinboardLibModule { }
