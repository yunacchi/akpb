import { CharacterTableFile } from './character-table';
import { SkinTableFile } from './skin-table';
import { GameDataConstFile } from './game-data-const';
import { AkhrCharaData } from './tl-akhr';

export interface GameDatabase {
  chars: CharacterTableFile;
  charsEN: CharacterTableFile;
  charsJP: CharacterTableFile;
  charsKR: CharacterTableFile;
  dataconst: GameDataConstFile;
  skintable: SkinTableFile;
  chars2: AkhrCharaData[];
}
