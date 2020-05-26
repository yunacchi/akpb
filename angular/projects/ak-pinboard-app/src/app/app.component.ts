import { Component } from '@angular/core';
import { GameRegionService } from 'projects/ak-pinboard-lib/src/lib/services/game-region.service';
import { CharaRepositoryService } from 'projects/ak-pinboard-lib/src/lib/services/chara-repository.service';
import { UserDataService, createUserData, applyUserData } from 'projects/ak-pinboard-lib/src/lib/services/user-data.service';
import { format as formatDate } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public keepObjectOrder = (a, b) => a.key;

  constructor(
    public regionService: GameRegionService,
    public charaService: CharaRepositoryService,
    public userDataService: UserDataService
  ) {
  }

  exportData() {
    const data = this.userDataService.exportData(this.charaService.charas.map(c => createUserData(c)));

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    const filename = `akpb-data_${formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    downloadAnchorNode.setAttribute('download', filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files[0];
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = readerEvent => {
        const data = readerEvent.target.result.toString();
        const charDataArray = this.userDataService.readImportData(JSON.parse(data));

        // Reset all chars
        for (const c of this.charaService.charas) {
          c.reset();
        }

        for (const charData of charDataArray) {
          const c = this.charaService.charaMap.get(charData.charId);
          if (c) {
            applyUserData(c, charData);
            this.charaService.updateCharaSkin(c);
            c.computeStats();
            this.charaService.updateCharaSkill(c);
          }
        }

        for (const c of this.charaService.charas) {
          this.charaService.saveChara(c);
        }

        this.charaService.reloadCharas$.next();
      };
    };

    input.click();
  }

  dataReset() {
    if (confirm('Reset all characters to Elite 0 level 1?')) {
      // Reset all chars
      for (const c of this.charaService.charas) {
        c.reset();
        this.charaService.saveChara(c);
      }
      this.charaService.reloadCharas$.next();
    }
  }
}
