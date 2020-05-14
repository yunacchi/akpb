import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { AppSettings, DefaultAppSettings } from './app-settings';
import { UserDataService } from 'projects/ak-pinboard-lib/src/lib/services/user-data.service';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private readonly _settings$: BehaviorSubject<AppSettings>;
  public readonly settings$: Observable<AppSettings>;

  constructor(
    private readonly userDataService: UserDataService
    ) {
      const s = userDataService.loadSettings(DefaultAppSettings);
      this._settings$ = new BehaviorSubject<AppSettings>(s);
      this.settings$ = this._settings$.asObservable();
  }

  public updateSettings( f: (s: AppSettings) => void ) {
    const s = this._settings$.value;
    f(s);
    this.userDataService.saveSettings(s);
    this._settings$.next(this._settings$.value);
  }
}
