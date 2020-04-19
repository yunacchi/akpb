import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { en_US, NgZorroAntdModule, NZ_I18N } from 'ng-zorro-antd';
import { AkPinboardLibModule } from 'projects/ak-pinboard-lib/src/public-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharaPageComponent } from './components/chara-page/chara-page.component';
import { OperatorListPageComponent } from './components/operator-list-page/operator-list-page.component';
import { TestPageComponent } from './components/test-page/test-page.component';
import { OperatorDetailPageComponent } from './components/operator-detail-page/operator-detail-page.component';
import { GameDataService } from 'projects/ak-pinboard-lib/src/lib/services/game-data.service';
import { OperatorPartyPageComponent } from './components/operator-party-page/operator-party-page.component';
import { CharacterAvatarComponent } from './components/character-avatar/character-avatar.component';

export function initAppAsync(
  gameData: GameDataService
  ): () => Promise<any> {
  // tslint:disable-next-line: only-arrow-functions
  return function() {
    return gameData.loadGameData$().toPromise();
  };
}

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TestPageComponent,
    CharaPageComponent,
    OperatorListPageComponent,
    OperatorDetailPageComponent,
    OperatorPartyPageComponent,
    CharacterAvatarComponent
  ],
  imports: [
    BrowserModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgZorroAntdModule,

    AkPinboardLibModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: APP_INITIALIZER, multi: true,
      useFactory: initAppAsync,
      deps: [GameDataService]
    },
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
