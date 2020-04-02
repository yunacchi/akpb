import { Component, OnInit } from '@angular/core';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { AkCharacter } from 'projects/ak-pinboard-lib/src/lib/abstractions/character';

import { orderBy } from 'lodash';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.scss']
})
export class TestPageComponent implements OnInit {
  charas: AkCharacter[];

  constructor(
    private readonly charaService: CharaRepositoryService

  ) { }

  ngOnInit(): void {
    const v = Array.from( this.charaService.charaMap.values() );
    this.charas = orderBy( v, [ (x) => x.data.rarity, (x) => x.charId ], ['desc', 'asc'] );
    // this.charas = [this.charaService.charaMap.get('char_002_amiya')];
  }

  charaClick(c) {
    const idx = this.charas.indexOf(c);

    if(idx >= 0) {
      this.charas.splice(idx, 1);
    }
  }

}
