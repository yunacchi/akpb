import { GameRegion } from './game-data/game-region';

export interface CharaTranslation {
  name: string;
  characteristic: string;
}

export type CharaTranslations = { [region in GameRegion]: CharaTranslation };
