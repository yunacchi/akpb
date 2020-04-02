import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class AppTitleService {
  prefix = 'AKPB';

  constructor(
    private readonly title: Title
  ) { }

  setPageTitle(newTitle?: string) {
    if (newTitle) {
      this.title.setTitle(`${this.prefix} - ${newTitle}`);
    } else {
      this.title.setTitle(this.prefix);
    }
  }
}
