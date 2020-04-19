import { AvgInstruction } from "./avg-loader";

export const aceshipRoot = 'https://cdn.jsdelivr.net/gh/Aceship/AN-EN-Tags@master';
export const commonAssetsRoot = 'https://assets.yunacchi.dev/akcn';
export const storyVariablesUrl = `${commonAssetsRoot}/avg/story/story_variables.json`;

export function prepareAssetsAsync(instructions: AvgInstruction[], storyVars: any): Promise<void> {
    const imgUrls: string[] = [];
    const bgmUrls: string[] = [];
    const sfxUrls: string[] = [];

    for(let x of instructions) {
        switch(x.type) {
            case 'background':
                if(x.params.image) {
                    const bgUrl = getBackgroundUrl(x.params.image, storyVars);
                    x.params._url = bgUrl;
                    if(!imgUrls.includes(bgUrl)) {
                        imgUrls.push(bgUrl);
                    }
                }
                break;
            case 'image':
                if(x.params.image) {
                    const imgUrl = getImageUrl(x.params.image, storyVars);
                    x.params._url = imgUrl;
                    if(!imgUrls.includes(imgUrl)) {
                        imgUrls.push(imgUrl);
                    }
                }
                break;
            case 'character':
                if(x.params.name) {
                    const charaUrl = getCharacterUrl(x.params.name, storyVars);
                    x.params._url = charaUrl;
                    if(!imgUrls.includes(charaUrl)) {
                        imgUrls.push(charaUrl);
                    }
                }
                if(x.params.name2) {
                    const charaUrl2 = getCharacterUrl(x.params.name2, storyVars);
                    x.params._url2 = charaUrl2;
                    if(!imgUrls.includes(charaUrl2)) {
                        imgUrls.push(charaUrl2);
                    }
                }
                break;
            case 'playmusic':
                if(x.params.intro) {
                    const introUrl = getBgmUrl(x.params.intro, storyVars);
                    x.params._introUrl = introUrl;
                    if(!bgmUrls.includes(introUrl)) {
                        bgmUrls.push(introUrl);
                    }
                }
                if(x.params.key) {
                    const keyUrl = getBgmUrl(x.params.key, storyVars);
                    x.params._keyUrl = keyUrl;
                    if(!bgmUrls.includes(keyUrl)) {
                        bgmUrls.push(keyUrl);
                    }
                }
                break;
            case 'playsound':
                if(x.params.key) {
                    const keyUrl = getSfxUrl(x.params.key, storyVars);
                    x.params._keyUrl = keyUrl;
                    if(!sfxUrls.includes(keyUrl)) {
                        sfxUrls.push(keyUrl);
                    }
                }
                break;
        }
    }

    // Preload queue!
    const queue = new createjs.LoadQueue(true);
    for(let u of imgUrls) {
        queue.loadFile(u);
    }
    for(let u of bgmUrls) {
        queue.loadFile(u);
    }
    for(let u of sfxUrls) {
        queue.loadFile(u);
    }

    return new Promise( (resolve,reject) => {
        queue.on("complete", () => resolve(), this);
    } );
}

function getBackgroundUrl(imgName: string, storyVars: any) {
    imgName = evalVar(imgName, storyVars).toLowerCase();
    return `${aceshipRoot}/img/avg/backgrounds/${imgName}.png`;
}

function getImageUrl(imgName: string, storyVars: any) {
    imgName = evalVar(imgName, storyVars).toLowerCase();
    return `${aceshipRoot}/img/avg/images/${imgName}.png`;
}

function getCharacterUrl(charaName: string, storyVars: any) {
    charaName = evalVar(charaName, storyVars);
    if(
        charaName.length > 3
        && charaName[charaName.length-2] === '#'
        ) {
            // Update chara name : char_002_amiya_1#6 => char_002_amiya_6.png
            charaName = charaName.substr(0, charaName.length - 3) + charaName[charaName.length-1]
        }
    return `${aceshipRoot}/img/avg/character/${charaName.toLowerCase()}.png`;
}

function getBgmUrl(bgmName: string, storyVars: any) {
    bgmName = evalVar(bgmName, storyVars);
    return mapSoundPath(bgmName);
}

function getSfxUrl(sfxName: string, storyVars: any) {
    sfxName = evalVar(sfxName, storyVars);
    return mapSoundPath(sfxName);
}

function mapSoundPath(path: string) {
    const lsi = path.lastIndexOf('/');
    if(lsi < 0) return path;
    const fileName = path.substr(lsi + 1).toLowerCase();
    const ext = 'ogg';

    if(path.startsWith('Sound_Beta_2/Music')) {
        return `${commonAssetsRoot}/audio/music/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/AVG')) {
        return `${commonAssetsRoot}/audio/avg/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/Dialog')) {
        return `${commonAssetsRoot}/audio/dialog/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/Player')) {
        return `${commonAssetsRoot}/audio/player/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/Enemy')) {
        return `${commonAssetsRoot}/audio/enemy/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/Battle')) {
        return `${commonAssetsRoot}/audio/battle/${fileName}.${ext}`
    }
    if(path.startsWith('Sound_Beta_2/General')) {
        return `${commonAssetsRoot}/audio/general/${fileName}.${ext}`
    }
    return path;
}

function evalVar(s: string, storyVars: any): string {
    if(s && s[0] === '$') {
        const varName = s.substr(1);
        if(storyVars.hasOwnProperty(varName)) {
            return storyVars[varName];
        }
    }
    return s;
}