import log from 'electron-log';
import request from 'request';
import { main } from './config/config';
import io from 'socket.io-client';
import fs from 'fs-extra';
import portscanner from 'portscanner';

const exec = require('child_process').exec;
const EventEmitter = require('events');

const osPlatform = main.osPlatform;
const homeDir = main.homeDir;
const defaultCoinsListFile = main.defaultCoinsListFile;
const marketmakerBin = main.marketmakerBin;
const marketmakerDir = main.marketmakerDir;

const isJsonString = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


class Emitter extends EventEmitter {
    constructor({ config }) {
        super();
        this.config = config;
        this.userLogout = false;
    }

    apiRequest({ data, url }) {
        data.gui = 'buildog';
        const jsonData = JSON.stringify(data);
        // Custom Header pass
        const headersOpt = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonData)
        };

        return new Promise((resolve, reject) => {
            request(
                {
                    method: 'post',
                    url,
                    form: jsonData,
                    headers: headersOpt,
                    json: true
                }, (error, response, body) => {
                if (error) {
                    return reject(error);
                }

                return resolve(body);
            });
        });
    }


    // kill rogue marketmaker copies on start
    killMarketmaker(data) {
        const self = this;
        self.userLogout = true;
        return new Promise(() => {
            if (data === true) {
                let marketmakerGrep;

                switch (osPlatform) {
                case 'darwin':
                    marketmakerGrep = 'ps -p $(ps -A | grep -m1 marketmaker | awk \'{print $1}\') | grep -i marketmaker';
                    break;
                case 'linux':
                    marketmakerGrep = 'ps -p $(pidof marketmaker) | grep -i marketmaker';
                    break;
                case 'win32':
                    marketmakerGrep = 'tasklist';
                    break;
                default:
                    break;
                }

                exec(marketmakerGrep, (error, stdout) => {
                    if (stdout.indexOf('marketmaker') > -1) {
                        const pkillCmd = osPlatform === 'win32' ? 'taskkill /f /im marketmaker.exe' : 'pkill -15 marketmaker';

                        console.log('found another marketmaker process(es)');

                        exec(pkillCmd, (error, stdout, stderr) => {
                            console.log(`${pkillCmd} is issued`);

                            if (error !== null) {
                                console.log(`${pkillCmd} exec error: ${error}`);
                                // self.emit('notifier', { error: 1 });
                            }
                        });
                    }

                    if (error !== null) {
                        console.log(`${marketmakerGrep} exec error: ${error}`);
                        // self.emit('notifier', { error: 1 });
                    } else {
                        // self.emit('logoutCallback', { type: 'success' });
                        // self.userpass = '';
                        // self.mypubkey = '';
                        // self.coins = '';
                        // resolve('killed marketmaker');
                    }
                });
            }
        });
    }

    logout() {
        this.userpass = '';
        this.mypubkey = '';
        this.coins = '';
        this.emit('logoutCallback', { type: 'success' });
    }


    startMarketMaker(data) {
        const self = this;
        self.userLogout = false;
        const passphrase = data.passphrase.trim();

          // console.log(data.passphrase);
        try {
          // check if marketmaker instance is already running
            portscanner.checkPortStatus(7783, '127.0.0.1', (error, status) => {
            // Status is 'open' if currently in use or 'closed' if available
                if (status === 'closed') {
                    const coinsListFile = `${marketmakerDir}/coins.json`;
                    const coinslist = fs.readJsonSync(defaultCoinsListFile, { throws: false });
                    fs.pathExists(coinsListFile, (err, exists) => {
                        if (exists === true) {
                            self.execMarketMaker({ coinslist, passphrase });
                        } else if (exists === false) {
                            console.log('coinslist file doesn\'t exist');
                            fs.copy(defaultCoinsListFile, coinsListFile)
                            .then(() => {
                                console.log('file copied!');
                                self.execMarketMaker({ coinslist, passphrase });
                            })
                            .catch(err => {
                                console.error(err)
                            })
                        }
                        if (err) {
                            console.log(err) // => null
                        }
                    })
                } else {
                    console.log(`port 7783 marketmaker is already in use`);
                    self.emit('loginCallback', { type: 'success', passphrase });
                }
            });
        } catch (e) {
            console.log(`failed to start marketmaker err: ${e}`);
        }
    }


    execMarketMaker(data) {
        const self = this;
          // start marketmaker via exec
        let params = {
            gui: 'buildog',
            client: 1,
            userhome: homeDir,
            passphrase: data.passphrase.trim()
        };

        const bin = marketmakerBin;

        if (osPlatform !== 'win32') {
            params.coins = data.coinslist;
            params = JSON.stringify(params);
            params = `'${params}'`;
        } else {
            params = JSON.stringify(params);
            params = params.replace(/"/g, '\\"');
	    params = '"' + params +'"';
        }
        exec(`"${marketmakerBin}" ${params}`, {
            cwd: marketmakerDir
            // maxBuffer: 1024 * 10000 // 10 mb
        }, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            if (stderr.length) {
                console.log(`stderr: ${stderr}`);
                !self.userLogout && self.emit('notifier', { error: 9, desc: stderr });
            }
            console.log('exed');
        });

        self.emit('loginCallback', { type: 'success', passphrase: data.passphrase });
    }

    fetchMarket() {
        const self = this;
        request('http://coincap.io/front', (error, response, body) => {
            isJsonString(body) && self.emit('marketUpdate', { data: JSON.parse(body) });
        });
    }

    fetchCoins() {
        const self = this;

        self.getCoins({ }).then((coinsList) => {
            self.emit('coinsList', coinsList);
        })
    }

    fetchBots() {
        const self = this;
        const data = { userpass: self.userpass, method: 'bot_list' };
        const url = 'http://127.0.0.1:7783';

        const fetch = new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log('botIDs');
            console.log(result);
            resolve(result);
        }).catch((error) => {
            console.log(`error getcoin ${coin}`)
            reject(error);
        }));


        const getstatus = (botList) => botList.map((botID) => self.botstatus(botID).then((botStatus) => botStatus))

        return fetch.then((botList) => Promise.all(getstatus(botList))).then((botlist) => self.emit('botstatus', botlist))
    }

    checkMMStatus() {
        const self = this;
        portscanner.checkPortStatus(7783, '127.0.0.1', (error, status) => {
            self.emit('MMStatus', status);
        })
    }

    getUserpass(passphrase) {
        const self = this;
        const data = { method: 'passphrase', passphrase };
        const url = 'http://127.0.0.1:7783';

        this.apiRequest({ data, url }).then((result) => {
            const { userpass, mypubkey } = result;

            self.userpass = userpass;
            self.mypubkey = mypubkey;
            self.getCoins({ withoutBalance: true }).then((coinsList) => {
                // coinsList may return an object instead of an array if it's the first call which return the userpass.
                self.emit('coinsList', coinsList.coins || coinsList);
                self.emit('updateUserInfo', { userpass, mypubkey });
            })
        }).catch((error) => {
            console.log(error);
            self.emit('notifier', { error: 2, desc: error.code })
        });
    }


    balance({ coin, address }) {
        const self = this;
        const data = { userpass: self.userpass, method: 'balance', coin, address };
        const url = 'http://127.0.0.1:7783';

        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            resolve(result);
        }).catch((error) => {
            console.log(`error getbalance ${coin}`)
            reject(error);
        }));
    }


    getCoins({ withoutBalance }) {
        const self = this;
        const data = { userpass: self.userpass, method: 'getcoins' };
        const url = 'http://127.0.0.1:7783';

        const fetch = new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            resolve(result);
        }).catch((error) => {
            console.log(`error getcoin ${coin}`)
            reject(error);
        }));


        const updateBalance = (coinList) => coinList.map((coin) => {
            if (coin.electrum && !withoutBalance) {
                return self.listunspent({ coin: coin.coin, address: coin.smartaddress }).then(() => self.balance({ coin: coin.coin, address: coin.smartaddress }).then((coinBalance) => {
                    coin.balance = coinBalance.balance;
                    return coin;
                }));
            }

            return coin;
        })

        return fetch.then((coinList) => Promise.all(updateBalance(coinList || [])))
    }

    disableCoin({ coin = '', type }) {
        const self = this;

        const data = { userpass: self.userpass, method: 'disable', coin };

        const url = 'http://127.0.0.1:7783';

        this.apiRequest({ data, url }).then((result) => {
            self.fetchPortfolio(() => this.emit('updateTrade', { coin, type }));
        }).catch((error) => {
            self.emit('notifier', { error: 3 })
        });
    }


    enableCoin({ coin = '', type, electrum = false, ipaddr, port }) {
        const self = this;
        let data;

        if (electrum) {
            data = { userpass: self.userpass, method: 'electrum', coin, ipaddr, port };
        } else {
            data = { userpass: self.userpass, method: 'enable', coin };
        }
        const url = 'http://127.0.0.1:7783';

        this.apiRequest({ data, url }).then((result) => {
            console.log(result);
            if (result.error) {
                return self.emit('notifier', { error: 3, desc: result.error })
            }
            self.getCoins({ withoutBalance: true }).then((coinsList) => {
                self.emit('coinsList', coinsList);
                self.emit('coinEnabled', { coin });
                type && this.emit('updateTrade', { coin, type });
            })
        }).catch((error) => {
            self.emit('notifier', { error: 3 })
        });
    }

    fetchPortfolio() {
        const self = this;
        const data = { userpass: self.userpass, method: 'portfolio' };
        const url = 'http://127.0.0.1:7783';
        this.apiRequest({ data, url }).then((result) => {
            // body.portfolio.map((item) => item.balance = self.balance({ coin: item.coin, address: item.address }))

            self.emit('setPortfolio', { portfolio: result.portfolio });
        }).catch((error) => {
            self.emit('notifier', { error: 4, desc: marketmakerBin })
        });
    }

    orderbook({ base, rel }) {
        const self = this;
        const data = { userpass: this.userpass, method: 'orderbook', base, rel };
        const url = 'http://127.0.0.1:7783';
        this.apiRequest({ data, url }).then((result) => {
            self.emit('orderbook', { base, rel, data: result })
        }).catch((error) => {
            self.emit('notifier', { error: 5 })
        });
    }

    trade({ method = 'bot_sell', base, rel, price, volume }) {
        const self = this;


        const data = { userpass: self.userpass, method, base, rel };

        if (method === 'bot_sell') {
            data.basevolume = volume;
            data.minprice = price;
        } else {
            data.relvolume = volume;
            data.maxprice = price;
        }


        const url = 'http://127.0.0.1:7783';

        const tradeRequest = () => self.apiRequest({ data, url }).then((result) => {
            console.log(`${method} submitted`);
            console.log(result);
            if (!result.error) {
                self.emit('trade', result);
            } else {
                self.emit('notifier', { error: 7, desc: result.error })
            }
        }).catch((error) => {
            self.emit('notifier', { error: 7 })
        });


        return self.inventory({ coin: rel }).then((inventor) => {
            // volume/3 + 5*txfee <- 3 times and txfee 3 times
            const txfee = (volume / 3 + (2 * (volume / 100)));
            const mainSplit = volume + (5 * txfee);
            return self.withdraw({
                address: inventor.alice[0].address,
                coin: inventor.alice[0].coin,
                amounts: [
                    { [inventor.alice[0].address]: mainSplit },
                    { [inventor.alice[0].address]: mainSplit },
                    { [inventor.alice[0].address]: mainSplit },
                    { [inventor.alice[0].address]: txfee },
                    { [inventor.alice[0].address]: txfee },
                    { [inventor.alice[0].address]: txfee }
                ]
            }).then((withdrawResult) => {
                self.sendrawtransaction({ coin: rel, signedtx: withdrawResult.hex }).then(() => tradeRequest())
            })
        })
    }


    botstatus(botid) {
        const self = this;
        const data = { userpass: self.userpass, method: 'bot_status', botid };
        const url = 'http://127.0.0.1:7783';

        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log(`${botid} status`);
            console.log(result);
            resolve(result);
        }).catch((error) => {
            console.log(`error botstatus ${botid}`)
            reject(error);
        }));
    }

    toggleBot({ botid, method }) {
        const self = this;
        const data = { userpass: self.userpass, method, botid };
        const url = 'http://127.0.0.1:7783';

        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log(`${botid} ${method}`);
            if (method === 'bot_stop') {
                self.emit('botStopped', result);
            } else {
                self.emit('botResumed', result);
            }

            resolve(result);
        }).catch((error) => {
            console.log(`error botstop ${botid}`)
            reject(error);
        }));
    }

    sendrawtransaction({ coin, signedtx, confirmation }) {
        const self = this;
        const data = { userpass: self.userpass, method: 'sendrawtransaction', coin, signedtx };
        const url = 'http://127.0.0.1:7783';
        console.log(data);
        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log(`sendWithdraw ${coin}`);
            console.log(result);
            resolve(result);
            confirmation && self.emit('sendrawtransaction', result);
        }).catch((error) => {
            console.log(`error sendWithdraw ${coin}`)
            reject(error);
        }));
    }

    withdraw({ address, coin, amount, amounts, confirmation }) {
        const outputs = amounts || [{ [address]: amount }];
        const self = this;
        const data = { userpass: self.userpass,
            method: 'withdraw',
            coin,
            outputs };

        console.log(data);
        const url = 'http://127.0.0.1:7783';
        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            confirmation && console.log(`withdraw for ${coin}`);
            !confirmation && console.log(`split balance into UTXOS for ${coin}`);
            console.log(result);
            if (result.complete) {
                confirmation && self.emit('confirmWithdraw', result);
            } else if (confirmation) {
                self.emit('notifier', { error: 10 })
            } else {
                self.emit('notifier', { error: 11 })
            }
            resolve(result);
        }).catch((error) => {
            console.log('error withdraw')
            reject(error);
        }));
    }

    inventory({ coin }) {
        const self = this;
        const data = { userpass: self.userpass, method: 'inventory', coin };
        const url = 'http://127.0.0.1:7783';

        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log(`inventory for ${coin}`);
            console.log(result);
            resolve(result);
        }).catch((error) => {
            console.log(`error inventory ${coin}`)
            reject(error);
        }));
    }

    listunspent({ coin, address }) {
        const self = this;
        const data = { userpass: self.userpass, method: 'listunspent', coin, address };
        const url = 'http://127.0.0.1:7783';

        return new Promise((resolve, reject) => this.apiRequest({ data, url }).then((result) => {
            console.log(`listunspent for ${coin}`);
            console.log(result);
            resolve(result);
        }).catch((error) => {
            console.log('error listunspent')
            reject(error);
        }));
    }

}

export const API = () => new Emitter({ config: main, log });
