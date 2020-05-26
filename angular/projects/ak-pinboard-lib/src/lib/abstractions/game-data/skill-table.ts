export interface SkillTableFile { [skillId: string]: SkillInfo; }

export interface SkillInfo {
  skillId: string;
  iconId: string | null;
  levels: any[];
}
