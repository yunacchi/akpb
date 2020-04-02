export interface CharacterTableFile {
  [cid: string]: CharaData;
}

export interface CharaData {
  cid: string;
  name: string;
  description: string;
  canUseGeneralPotentialItem: boolean;
  potentialItemId: string;
  team: number;
  displayNumber: string;
  tokenKey: any;
  appellation: string;
  position: string;
  tagList: string[];
  displayLogo: string;
  itemUsage: string;
  itemDesc: string;
  itemObtainApproach: string;
  maxPotentialLevel: number;
  rarity: number;
  profession: string;
  trait: any;
  phases: CharaPhase[];
  skills: any[];
  talents: any[];
  potentialRanks: any[];
  favorKeyFrames: CharaAttributeKeyFrame[];
  allSkillLvlup: any[];
}

export interface CharaPhase {
  characterPrefabKey: string;
  rangeId: string;
  maxLevel: number;
  evolveCost: any;
  attributesKeyFrames: CharaAttributeKeyFrame[];
}

export interface CharaAttributeKeyFrame {
  level: number;
  data: CharaAttributes;
}

export interface BaseCharaAttributes {
  maxHp: number;
  atk: number;
  def: number;
  magicResistance: number;
  cost: number;
  blockCnt: number;
  moveSpeed: number;
  attackSpeed: number;
  baseAttackTime: number;
  respawnTime: number;
  hpRecoveryPerSec: number;
  spRecoveryPerSec: number;
  maxDeployCount: number;
  maxDeckStackCnt: number;
  tauntLevel: number;
  massLevel: number;
  baseForceLevel: number;
}

export interface CharaAttributes extends BaseCharaAttributes {
  stunImmune: boolean;
  silenceImmune: boolean;
}
