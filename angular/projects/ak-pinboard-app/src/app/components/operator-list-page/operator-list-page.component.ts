import { Component, OnInit } from '@angular/core';
import { AppTitleService } from '../../services/app-title.service';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';
import { orderBy } from 'lodash';
import { Router } from '@angular/router';

@Component({
  selector: 'app-operator-list-page',
  templateUrl: './operator-list-page.component.html',
  styleUrls: ['./operator-list-page.component.scss']
})
export class OperatorListPageComponent implements OnInit {

  public myOperators: AkCharacter[] = [];
  public remainingOperators: AkCharacter[] = [];

  constructor(
    private readonly title: AppTitleService,
    private readonly charaService: CharaRepositoryService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.title.setPageTitle('Operators');
    this.reloadCharas();
  }

  reloadCharas() {
    this.myOperators = this.charaService.charas.filter(c => c.hired);
    this.remainingOperators = this.charaService.charas.filter(c => !c.hired);
    this.sortCharas();
  }

  sortCharas() {
    this.myOperators = orderBy(
      this.myOperators,
      ['data.rarity', 'level', 'phaseIdx', 'data.name'],
      ['desc', 'desc', 'desc', 'asc']
    );
    this.remainingOperators = orderBy(
      this.remainingOperators,
      ['data.rarity', 'level', 'phaseIdx', 'data.name'],
      ['desc', 'desc', 'desc', 'asc']
    );
  }

  onCharaClick(c: AkCharacter) {
    c.hire();
    this.router.navigate(['operators', c.charId]);
  }
}
