import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { NgModule } from '@angular/core';
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

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    TestPageComponent,
    CharaPageComponent,
    OperatorListPageComponent,
    OperatorDetailPageComponent
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
    { provide: NZ_I18N, useValue: en_US }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
