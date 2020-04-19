import { loadAvgFileAsync, AvgInstruction, loadStoryVarsAsync } from './avg-loader';
import { prepareAssetsAsync } from './avg-assets';
import { Howl, Howler } from 'howler';
import anime from 'animejs/lib/anime.es.js'

export class AkAvgPlayer {
    private currentIdx: number = -1;
    avgInstructions: AvgInstruction[] = [];
    storyVars: any;

    backgroundElement: HTMLElement;
    imageElement: HTMLElement;
    chara1Element: HTMLElement;
    chara2Element: HTMLElement;
    blockerElement: HTMLElement;
    textBoxElement: HTMLElement;
    textBoxNameElement: HTMLElement;
    textBoxContentElement: HTMLElement;

    // ADV state
    bgUrl: string;
    charaUrl: string;
    chara2Url: string;

    currentMusic?: AvgInstruction;
    bgmIntro?: Howl;
    bgmLoop?: Howl;
    readonly sounds: Howl[] = [];
    cursorOverlayElement: HTMLElement;

    constructor(
        public readonly root: HTMLElement,
        public readonly storyUrl: string
    ) {
        this.backgroundElement = root.getElementsByClassName('avg-background')[0] as HTMLElement;
        this.imageElement = root.getElementsByClassName('avg-image')[0] as HTMLElement;
        this.chara1Element = root.getElementsByClassName('avg-character')[0] as HTMLElement;
        this.chara2Element = root.getElementsByClassName('avg-character')[1] as HTMLElement;
        this.blockerElement = root.getElementsByClassName('avg-blocker')[0] as HTMLElement;
        this.textBoxElement = root.getElementsByClassName('avg-text-box')[0] as HTMLElement;
        this.textBoxNameElement = root.getElementsByClassName('avg-text-box-name')[0] as HTMLElement;
        this.textBoxContentElement = root.getElementsByClassName('avg-text-box-content')[0] as HTMLElement;
        this.cursorOverlayElement = root.getElementsByClassName('avg-cursor-overlay')[0] as HTMLElement;

        this.cursorOverlayElement.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            this.next();
        }
    }

    public async initAsync() {
        this.storyVars = await loadStoryVarsAsync();
        this.avgInstructions = await loadAvgFileAsync(this.storyUrl);
        await prepareAssetsAsync(this.avgInstructions, this.storyVars);
        this.currentIdx = -1;
        this.next();
    }

    private next() {
        ++this.currentIdx;
        if (this.currentIdx > this.avgInstructions.length - 1) {
            this.currentIdx = -1;
            console.log('End-of-file');
            this.resetState();
            return;
        }

        if (this.runInstruction(this.avgInstructions[this.currentIdx])) {
            this.next();
        }
    }

    runInstruction(x: AvgInstruction): boolean {
        console.debug(x.type, x.params, x.text);
        if (x.type === 'dialogtext' || x.type === 'dialog') {
            this.setDialog(x);
            return false;
        }
        if (x.type === 'playmusic') {
            this.playMusic(x);
            return true; // Trigger next immediately
        }
        if (x.type === 'delay') {
            this.delay(x);
            return false;
        }
        if (x.type === 'playsound') {
            this.playSound(x);
            return true;
        }
        if (x.type === 'image') {
            this.setImage(x);
            return false;
        }
        if (x.type === 'background') {
            this.setBackground(x);
            return false;
        }
        if (x.type === 'blocker') {
            this.setBlocker(x);
            return false;
        }
        if (x.type === 'character') {
            this.setCharacter(x);
            return false;
        }
        if (x.type === 'stopmusic') {
            this.resetMusic();
            return true; // Trigger next immediately
        }
        console.warn(`Skipping unsupported instruction: ${x.type}`);
        return true; // Trigger next immediately
    }

    setBlocker(inst: AvgInstruction) {
        const el = this.blockerElement;
        let a = 0;
        let r = 0;
        let g = 0;
        let b = 0;
        let fadetimeMs = 0;
        let block = false;
        if (inst.params.a) { a = inst.params.a; }
        if (inst.params.r) { r = inst.params.r; }
        if (inst.params.g) { g = inst.params.g; }
        if (inst.params.b) { b = inst.params.b; }
        if (inst.params.fadetime) { fadetimeMs = inst.params.fadetime * 1000; }
        if (inst.params.block !== undefined) { block = inst.params.block; }

        const oldIdx = this.currentIdx;

        const onComplete = () => {
            if(this.currentIdx === oldIdx){ this.next(); }
        }
        anime({
            targets: el,
            duration: fadetimeMs,
            backgroundColor: `rgba(${r * 255},${g * 255},${b * 255},${a})`,
            autoplay: true,
            easing: 'easeInOutSine',
            complete: block ? () => onComplete() : undefined,
        });

        if(!block) {
            this.next();
        }
    }

    setDialog(inst: AvgInstruction) {
        const params = inst.params;
        if (inst.text) {
            this.textBoxElement.classList.add("active");

            if (params && params.name) {
                this.textBoxNameElement.classList.add("active");
                this.textBoxNameElement.textContent = params.name;
            } else {
                this.textBoxNameElement.classList.remove("active");
                this.textBoxNameElement.textContent = '';
            }
            this.textBoxContentElement.textContent = inst.text;
        } else {
            this.textBoxElement.classList.remove("active");
            this.textBoxContentElement.textContent = '';
            this.next();
        }
    }

    playMusic(inst: AvgInstruction) {
        this.resetMusic();
        this.currentMusic = inst;
        const x = inst.params;
        if (x._introUrl) {
            let volume = 1.0;
            let delayMs = 0;
            let crossfadeMs = 0;

            if (x.volume) {
                volume = x.volume;
            }
            if (x.delay) {
                delayMs = x.delay * 1000;
            }
            if (x.crossfade) {
                crossfadeMs = x.crossfade * 1000;
            }

            this.bgmIntro = new Howl({
                src: [x._introUrl],
                loop: false,
                volume: volume,
                onend: () => {
                    if (this.currentMusic === inst && this.bgmLoop) {
                        this.bgmLoop.play();
                    }
                },
                preload: true
            });
            this.bgmLoop = new Howl({
                src: [x._keyUrl],
                loop: true,
                volume: volume,
                preload: true
            });

            if (delayMs === 0) {
                this.doStartMusic(this.currentMusic, crossfadeMs, volume);
            } else {
                setTimeout(() => this.doStartMusic(this.currentMusic, crossfadeMs, volume), delayMs);
            }
        }
    }

    doStartMusic(inst: AvgInstruction, crossfadeMs: number, volume: number) {
        if (inst === this.currentMusic) {
            if (crossfadeMs > 0) {
                this.bgmIntro.volume(0.0);
                this.bgmIntro.play();
                this.bgmIntro.fade(0, volume, crossfadeMs);
            } else {
                this.bgmIntro.play();
            }
        }
    }

    resetMusic() {
        if (this.bgmIntro) {
            this.bgmIntro.unload();
            this.bgmIntro = undefined;
        }
        if (this.bgmLoop) {
            this.bgmLoop.unload();
            this.bgmLoop = undefined;
        }
        this.currentMusic = undefined;
    }

    delay(inst: AvgInstruction) {
        if (inst && inst.params && inst.params.time) {
            this.waitThenNext(inst.params.time * 1000);
        } else {
            this.next();
        }
    }

    waitThenNext(timeMs: number) {
        if (timeMs === 0) {
            this.next();
            return;
        }

        const oldIdx = this.currentIdx;
        setTimeout(() => {
            if (this.currentIdx === oldIdx) {
                this.next();
            }
        }, timeMs);
    }

    playSound(inst: AvgInstruction) {
        const params = inst.params;

        if (params && params._keyUrl) {
            let volume = 1.0;
            let delayMs = 0;
            let crossfadeMs = 0;

            if (params.volume) {
                volume = params.volume;
            }
            if (params.delay) {
                delayMs = params.delay * 1000;
            }
            if (params.crossfade) {
                crossfadeMs = params.crossfade * 1000;
            }

            const sound = new Howl({
                src: [params._keyUrl],
                loop: false,
                volume: volume,
                preload: true,
                onend: () => {
                    sound.unload();
                    const i = this.sounds.indexOf(sound);
                    if(i > 0) { this.sounds.splice(i, 1); } // Remove from array
                },
            });
            this.sounds.push(sound);

            if (delayMs === 0) {
                this.doStartSound(sound, crossfadeMs, volume);
            } else {
                setTimeout(() => this.doStartSound(sound, crossfadeMs, volume), delayMs);
            }
        }
    }

    resetSounds() {
        for(let s of this.sounds) {
            s.unload();
        }
        this.sounds.splice(0, this.sounds.length); // Clear array
    }

    doStartSound(sound: Howl, crossfadeMs: number, volume: number) {
        if (crossfadeMs > 0) {
            sound.volume(0.0);
            sound.play();
            sound.fade(0, volume, crossfadeMs);
        } else {
            sound.play();
        }
    }

    setImage(img: AvgInstruction) {
        const params = img.params;
        let fadetimeMs = 0;
        let block = false;
        if (params.fadetime) { fadetimeMs = params.fadetime * 1000; }
        if (params.block !== undefined) { block = params.block; }

        this.setElementBackground(this.imageElement, params._url, fadetimeMs, block, false);
    }

    setBackground(img: AvgInstruction) {
        const params = img.params;
        let fadetimeMs = 0;
        let block = false;
        if (params.fadetime) { fadetimeMs = params.fadetime * 1000; }
        if (params.block !== undefined) {  block = params.block; }

        this.setElementBackground(this.backgroundElement, params._url, fadetimeMs, block, false);
    }

    setElementBackground(el: HTMLElement, url: string, fadetimeMs: number, block: boolean, skipNext: boolean) {
        const clearImage = !url;
        el.style.backgroundImage = clearImage ? '' : `url("${url}")`;
        const startOpacity = clearImage ? 1 : 0;
        const endOpacity = clearImage ? 0 : 1;
        
        if (block && fadetimeMs > 0) {
            const oldIdx = this.currentIdx;
            const onComplete = () => {
                if(skipNext) return;
                console.log('clearImage', clearImage);
                if(this.currentIdx === oldIdx){ this.next(); }
            }

            el.style.opacity = startOpacity.toString();
            anime({
                targets: el,
                duration: fadetimeMs,
                opacity: endOpacity,
                autoplay: true,
                easing: 'easeInOutSine',
                complete: block ? () => onComplete() : () => { console.log('transition complete') },
            });
        } else {
            el.style.opacity = endOpacity.toString();
            if(skipNext) return;
            this.next();
        }
    }

    setCharacter(inst: AvgInstruction) {
        const params = inst.params;
        const name: string|undefined = params.name;
        const name2: string|undefined = params.name2;
        let focus: number|undefined = params.focus;
        let fadetime: number|undefined = params.focus;
        if (fadetime === undefined) { fadetime = 0; }
        
        if(name && name2) {
            this.setCharaElement(this.chara1Element, params._url, focus === 1 || focus === 3);
            this.setCharaElement(this.chara2Element, params._url2, focus === 2 || focus === 3);
        } else if(name) {
            this.setCharaElement(this.chara1Element, params._url, true);
            this.setCharaElement(this.chara2Element);
        } else {
            this.setCharaElement(this.chara1Element);
            this.setCharaElement(this.chara2Element);
        }

        this.next();
    }

    setCharaElement( el: HTMLElement, url?: string, focused?: boolean) {
        if(url) {
            el.style.backgroundImage = `url("${url}")`;
            el.classList.add("active");
            if(focused) {
                el.classList.add("focused");
            } else {
                el.classList.remove("focused");
            }
        } else {
            el.classList.remove("active");
            el.classList.remove("focused");
            el.style.backgroundImage = undefined;
        }
    }

    resetState() {
        this.setCharaElement(this.chara1Element);
        this.setCharaElement(this.chara2Element);
        this.setElementBackground(this.imageElement, '', 0, false, true);
        this.setElementBackground(this.backgroundElement, '', 0, false, true);
        this.resetSounds();
        this.resetMusic();
        this.blockerElement.style.backgroundColor = '';
        this.textBoxElement.classList.remove("active");
        this.textBoxNameElement.classList.remove("active");
    }
}