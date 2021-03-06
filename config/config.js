/*
    Configuration store for the dependencies and frame config
*/
import os from 'os';
import fixPath from 'fix-path';
import path from 'path';

const osPlatform = os.platform();


const homeDir = require('os').homedir();
const appRootDir = require('app-root-dir').get();

const env = process.env.NODE_ENV;
const assetChainPorts = {
    marketmaker: '7779',
    komodod: '7771',
    SUPERNET: '11341',
    REVS: '10196',
    WLC: '12167',
    PANGEA: '10074',
    DEX: '9503',
    JUMBLR: '10789',
    BET: '11222',
    CRYPTO: '10420',
    HODL: '8010',
    SHARK: '14104',
    BOTS: '10151',
    MGW: '15524',
    KV: '9747',
    CEAL: '13097',
    MESH: '8400',
    USD: '13967',
    CHF: '15312',
    CAD: '8720',
    BRL: '9914',
    BGN: '9110',
    AUD: '8045',
    PLN: '13493',
    PHP: '11181',
    NZD: '10915',
    NOK: '11588',
    MYR: '10688',
    MXN: '13970',
    KRW: '14020',
    JPY: '13145',
    INR: '10536',
    ILS: '14638',
    IDR: '14459',
    HKD: '15409',
    HUF: '13699',
    GBP: '11505',
    EUR: '8065',
    DKK: '13830',
    CNY: '10384',
    ZAR: '15160',
    TRY: '13924',
    THB: '11847',
    SGD: '14475',
    SEK: '11447',
    RON: '8675',
    RUB: '8199',
    CZK: '9482'
};

// SETTING OS DIR TO RUN MARKETMAKER FROM
// SETTING APP ICON FOR LINUX AND WINDOWS
let marketmakerBin;
let marketmakerDir;
let marketmakerIcon;

/* Handle binaries paths */
const marketmaker = require('marketmaker').path;

const paths = { marketmaker };
const transformBinaryPath = (name) => paths[name].replace('bin', `node_modules/${name}/bin`).replace('app.asar', 'app.asar.unpacked');


if (env === 'development') {
    marketmakerBin = paths.marketmaker;
} else {
    marketmakerBin = transformBinaryPath('marketmaker');
}


if (os.platform() === 'darwin') {
    // fixPath();
    marketmakerDir = `${homeDir}/Library/Application Support/marketmaker`;
}

if (os.platform() === 'linux') {
    marketmakerDir = `${homeDir}/.marketmaker`;
}

if (os.platform() === 'win32') {
    marketmakerDir = `${process.env.APPDATA}/marketmaker`;
    marketmakerDir = path.normalize(marketmakerDir);
    marketmakerIcon = path.join(__dirname, '/app/assets/icons/agama_icons/agama_app_icon.ico');
}

console.log(marketmakerDir);

// DEFAULT COINS LIST FOR MARKETMAKER
const defaultCoinsListFile = path.join(__dirname, './coinslist.json');

export default {
    main: { homeDir, appRootDir, env, assetChainPorts, osPlatform, defaultCoinsListFile, marketmakerBin, marketmakerDir, marketmakerIcon }
}
