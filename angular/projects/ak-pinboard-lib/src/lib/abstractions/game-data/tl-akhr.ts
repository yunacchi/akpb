export interface AkhrCharaData {
  name_cn: string;
  name_en: string;
  name_jp: string;
  name_kr: string;
  characteristic_cn: string;
  characteristic_en: string;
  characteristic_jp: string;
  characteristic_kr: string;
  camp: string;
  type: string;
  level: number;
  sex: string;
  tags: string[];
  hidden: boolean;
  globalHidden?: boolean;
}
