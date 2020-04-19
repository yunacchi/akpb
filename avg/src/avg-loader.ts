import * as axios from 'axios';
import { storyVariablesUrl } from './avg-assets';

export async function loadAvgFileAsync(url: string) {
    const response = await axios.default.get(url);
    return parseAvgFile(response.data);
}

export async function loadStoryVarsAsync() {
    const response = await axios.default.get(storyVariablesUrl);
    return response.data;
}

export interface AvgInstruction {
    type: string;
    params: any;
    text: string;
}

// These are very naive and will explode at the slightest hint of string escapes. // 
//const instructionRegex = /^\[([a-zA-Z0-9]+)(?:\(([^)]*)\))? *\](.*)$/mi;
const instructionRegex = /^\[([a-zA-Z0-9]+)(?:\((.*)\))?\](.*)$/mi;
const dialogRegex = /^(?:\[((?:[a-z0-9_-]+=)[^\]]+)\]) *(.+)$/mi;
const paramRegex = /([a-z0-9_-]+)=(\"[^"]*\"|[0-9](?:\.[0-9]*)*|true|false)(?:, *|$)/gmi;

export function parseAvgFile(fileContents: string): AvgInstruction[] {
    const instructions: AvgInstruction[] = [];
    const fileLines = fileContents.split("\n");
    for (let i = 0; i < fileLines.length; i++) {
        let l = fileLines[i];

        // Remove comment
        let cidx = l.indexOf('//');
        if (cidx > -1) {
            l = l.substring(0, cidx)
        }
        l = l.trim();

        // Skip empty lines
        if (l === '') continue;

        // Parse line
        // Too lazy to write an actual tokenizer, have Regexes instead.
        let m = instructionRegex.exec(l);
        if (m !== null) {
            // Instruction line
            instructions.push({
                type: m[1].toLowerCase(),
                params: parseParamString(m[2]),
                text: m[3]
            });
            continue;
        }

        m = dialogRegex.exec(l);
        if(m !== null) {
            // Dialog line
            instructions.push({
                type: 'dialogtext',
                params: parseParamString(m[1]),
                text: m[2]
            });
            continue;
        }
        console.log('Failed to match line: ', l);
    }
    return instructions;
}

function parseParamString(s: string): { [key: string]: any } {
    //paramRegex.lastIndex = 0; // This shouldn't be needed - a null match resets it automatically
    const params: { [key: string]: any } = {};
    let m: RegExpExecArray | null;
    while ((m = paramRegex.exec(s)) !== null) {
        const paramName = m[1].toLowerCase();
        const paramValue = JSON.parse(m[2]);
        params[paramName] = paramValue;
    }
    return params;
}