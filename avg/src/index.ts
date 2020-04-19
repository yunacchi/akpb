import './style.scss';
import { AkAvgPlayer } from './avg-player';
import { commonAssetsRoot } from './avg-assets';
import * as queryString from 'query-string';

// Also at AN-EN-Tags/json/gamedata/en_US/gamedata/story/obt/main/level_main_04-10_beg.txt
//let url = `${commonAssetsRoot}/avg/story/level_main_04-10_END.txt`;
let url = 'https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/story/obt/main/level_main_05-07_beg.txt'
const qs = queryString.parse(location.search);
if(qs && qs.url) {
    url = qs.url.toString();
}

const player = new AkAvgPlayer(
    document.getElementById('avg-root'),
    url
);

player.initAsync();