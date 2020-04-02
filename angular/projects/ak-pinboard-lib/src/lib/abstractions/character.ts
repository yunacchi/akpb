import { CharaData, CharaPhase, CharaAttributeKeyFrame, CharaAttributes, BaseCharaAttributes } from './character-table';
import { SkinInfo } from './skin-table';

export class AkCharacter {

  public phaseIdx = 0;
  public level = 1;
  public trust = 0;
  public potential = 0;
  public skinId: string;
  public hired = false;

  public skinInfo: SkinInfo;
  public phase: CharaPhase;
  public absoluteLevel: number;
  public stats: BaseCharaAttributes;

  constructor(
    public readonly charId: string,
    public readonly data: CharaData
  ) {
    this.phase = data.phases[0];
    this.absoluteLevel = 1;
    this.stats = createAttributes();
  }

  public setSkin(skinInfo: SkinInfo) {
    if (skinInfo) {
      this.skinInfo = skinInfo;
    }
  }

  public setPhaseIdx(phaseIdx: number) {
    if (phaseIdx >= 0 && phaseIdx < this.data.phases.length && phaseIdx !== this.phaseIdx) {
      this.phaseIdx = phaseIdx;
      this.phase = this.data.phases[phaseIdx];
      this.setLevel(1);
    }
  }

  public setLevel(level: number) {
    if (level > 0 && level <= this.phase.maxLevel) {
      this.level = level;
      let absoluteLevel = level;
      for (let i = 0; i < this.phaseIdx; i++) {
        absoluteLevel += this.data.phases[0].maxLevel;
      }
      this.absoluteLevel = 0;
      this.computeStats();
    }
  }

  public setTrust(trust: number) {
    if (trust >= 0 && trust <= 200) {
      this.trust = trust;
      this.computeStats();
    }
  }

  public setPotential(potential: number) {
    if (potential >= 0 && potential < 5) {
      this.potential = potential;
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

    // Add stats from trust/favor
    const favor = this.trust / 2; // 200 Trust = 100 Favor
    addAttributesFromRange(stats, favor, this.data.favorKeyFrames);

    // TODO: Add stats from passives - talents, potentialRanks

    this.stats = stats;
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
      // console.log(`${p} = ${prevVal} + ((${nextVal} - ${prevVal}) / (${next.level} - ${prev.level})) * (${l} - ${prev.level});`)
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
