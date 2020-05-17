import { CharaData, CharaPhase, CharaAttributeKeyFrame, CharaAttributes, BaseCharaAttributes } from './game-data/character-table';
import { SkinInfo } from './game-data/skin-table';
import { GameRegion } from './game-data/game-region';
import { CharaTranslations, CharaTranslation } from './tl-data';

export class AkCharacter {

  public evolvePhase = 0;
  public level = 1;
  public trustPct = 0;
  public potentialRank = 0;
  public overrideSkinId?: string;
  public hired = false;

  public skinInfo: SkinInfo;
  public phase: CharaPhase;
  public absoluteLevel: number;
  public stats: BaseCharaAttributes;
  public data: CharaData;
  public regions: GameRegion[];
  public tl: CharaTranslation;

  constructor(
    public readonly charId: string,
    public readonly regionData: { [key in GameRegion]?: CharaData },
    public readonly translations: CharaTranslations,
    public region: GameRegion,
    public language: GameRegion
  ) {
    this.regions = Object.keys(regionData) as GameRegion[];
    this.absoluteLevel = 1;

    this.setLanguage(language);
    this.setRegion(region);
    this.stats = createAttributes();
  }

  public setLanguage(newLanguage: GameRegion) {
    this.language = newLanguage;
    this.tl = this.translations[newLanguage];
  }

  public setRegion(newRegion: GameRegion) {
    this.region = newRegion;
    this.data = this.regionData[newRegion] || this.regionData.zh_CN;
    this.phase = this.data.phases[this.evolvePhase];
  }

  public setSkin(skinInfo: SkinInfo) {
    if (skinInfo) {
      this.skinInfo = skinInfo;
    }
  }

  public setEvolvePhase(evolvePhase: number) {
    if (evolvePhase >= 0 && evolvePhase < this.data.phases.length && evolvePhase !== this.evolvePhase) {
      this.evolvePhase = evolvePhase;
      this.phase = this.data.phases[evolvePhase];
      this.setLevel(1);
    }
  }

  public setLevel(level: number) {
    if (level > 0 && level <= this.phase.maxLevel) {
      this.level = level;
      let absoluteLevel = level;
      for (let i = 0; i < this.evolvePhase; i++) {
        absoluteLevel += this.data.phases[0].maxLevel;
      }
      this.absoluteLevel = 0;
      this.computeStats();
    }
  }

  public setTrust(trustPct: number) {
    if (trustPct >= 0 && trustPct <= 200) {
      this.trustPct = trustPct;
      this.computeStats();
    }
  }

  public setPotential(potentialRank: number) {
    if (potentialRank >= 0 && potentialRank < 5) {
      this.potentialRank = potentialRank;
    }
  }

  public hire() {
    this.hired = true;
  }

  public fire() {
    this.hired = false;
  }

  public computeStats() {
    const stats: BaseCharaAttributes = createAttributes();

    // Add stats from level and phase
    addAttributesFromRange(stats, this.level, this.phase.attributesKeyFrames);

    // Add stats from trustPct/favor
    const favor = this.trustPct / 2; // 200 trustPct = 100 Favor
    addAttributesFromRange(stats, favor, this.data.favorKeyFrames);

    // TODO: Add stats from passives - talents, potentialRanks

    this.stats = stats;
  }

  public reset() {
    this.hired = false;
    this.trustPct = 0;
    this.potentialRank = 0;
    this.absoluteLevel = 1;
    this.level = 1;
    this.evolvePhase = 0;
    this.phase = this.data.phases[0];
    this.overrideSkinId = undefined;
    // Call computeStats() and updateSkin() after
  }
}

function addAttributesFromRange(stats: BaseCharaAttributes, l: number, kf: CharaAttributeKeyFrame[]) {
  const attrKeyframes = findKeyframeBounds(l, kf);
  if (attrKeyframes[0] && attrKeyframes[1]) {
    const prev = attrKeyframes[0];
    const next = attrKeyframes[1];
    // Compute attributes from level - linear interpolation between keyframes
    // minStat + ( (maxStat-minStat) / ( maxLevel - minLevel ) ) * ( level - minLevel )
    for (const p of attributeNames) {
      const prevVal = prev.data[p] as number;
      const nextVal = next.data[p] as number;
      stats[p] += Math.trunc(prevVal + ((nextVal - prevVal) / (next.level - prev.level)) * (l - prev.level));
    }
  } else if (attrKeyframes[0]) {
    for (const p of attributeNames) {
      stats[p] += attrKeyframes[0].data[p];
    }
  } else if (attrKeyframes[1]) {
    for (const p of attributeNames) {
      stats[p] += attrKeyframes[1].data[p];
    }
  }
}

const attributeNames: (keyof BaseCharaAttributes)[] = [
  'maxHp',
  'atk',
  'def',
  'magicResistance',
  'cost',
  'blockCnt',
  'moveSpeed',
  'attackSpeed',
  'baseAttackTime',
  'respawnTime',
  'hpRecoveryPerSec',
  'spRecoveryPerSec',
  'maxDeployCount',
  'maxDeckStackCnt',
  'tauntLevel',
  'massLevel',
  'baseForceLevel',
];

function createAttributes(): BaseCharaAttributes {
  return {
    maxHp: 0,
    atk: 0,
    def: 0,
    magicResistance: 0,
    cost: 0,
    blockCnt: 0,
    moveSpeed: 0,
    attackSpeed: 0,
    baseAttackTime: 0,
    respawnTime: 0,
    hpRecoveryPerSec: 0,
    spRecoveryPerSec: 0,
    maxDeployCount: 0,
    maxDeckStackCnt: 0,
    tauntLevel: 0,
    massLevel: 0,
    baseForceLevel: 0,
  }
}

function findKeyframeBounds(v: number, keyframes: CharaAttributeKeyFrame[]) {
  // < 0: a before b - > 0: b before a
  const prev = keyframes
    .filter(kf => kf.level <= v)
    .sort((a, b) => a.level > b.level ? -1 : 1)[0];
  const next = keyframes
    .filter(kf => kf.level > v)
    .sort((a, b) => a.level < b.level ? -1 : 1)[0];
  return [prev, next];
}
