export interface SkinTableFile {
  charSkins: { [skinId: string]: SkinInfo };
  buildinEvolveMap: { [charId: string]: { [phaseId: string]: string } }
}

export interface SkinInfo {
  skinId: string;
  charId: string;
  tokenSkinId: null;
  illustId: string;
  avatarId: string;
  portraitId: string;
  buildingId: null;
  battleSkin: BattleSkin;
  isBuySkin: boolean;
  displaySkin: DisplaySkin;
}

export interface BattleSkin {
  overwritePrefab: boolean;
  skinOrPrefabId: null;
}

export interface DisplaySkin {
  skinName: null;
  colorList: string[];
  titleList: any[];
  modelName: string;
  drawerName: string;
  skinGroupId: string;
  skinGroupName: string;
  skinGroupSortIndex: number;
  content: string;
  dialog: null;
  usage: null;
  description: null;
  obtainApproach: null;
}
