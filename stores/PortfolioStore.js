import { observable } from 'mobx';

import io from 'socket.io-client';

const request = require('request');
const formatCurrency = require('format-currency')


import { colors } from '../constants'

export default class PortfolioStore {
     @observable portfolio = [
        { name: 'Komodo', short: 'KMD', balance: 17400, evolution: 40.1 },
        { name: 'Bitcoin', short: 'BTC', balance: 0.2, evolution: 20.1 },
        { name: 'Ethereum', short: 'ETH', balance: 10, evolution: -0.1 }
     ];

     @observable market = {};

     @observable fiatRates = {
         eur: 3000,
         usd: 4000
     }

     @observable defaultCurrency = {};

    colors = colors;

    constructor({ defaultFiat }) {
        this.defaultCurrency = defaultFiat;
        this.formatFIAT = { format: '%s%v', symbol: this.defaultCurrency.symbol }
        const self = this;

        request('http://coincap.io/front', (error, response, body) => {
            self.market = JSON.parse(body);
            // update porfolio valuation in term of BTC
            self.portfolio.forEach(({ short }, key) => {
                const market = self.getCoin(short);
                const btc = self.getCoin('BTC');
                self.portfolio[key].btcBalance = (self.portfolio[key].balance * market.price) / btc.price;
                self.portfolio[key].usd = self.portfolio[key].balance * market.price;
            });
        });

        /* subscribe to updates */
        const socket = io.connect('http://socket.coincap.io/front');
        socket.on('trades', (msg) => {
            const { short, price } = msg;
            self.rates[short] = price;
        })
    }

    getCoin = (short) => this.market.filter((coin) => coin.short === short)[0];
    getPortfolioCoin = (short) => this.portfolio.filter((coin) => coin.short === short)[0];

    portfolioRenderBalance = (short) => {
        const opts = { format: '%v %c', code: short, maxFraction: 8 };
        return formatCurrency(this.getPortfolioCoin(short).balance, opts)
    }

    portfolioRenderBTC = (short) => {
        const opts = { format: '%v %c', code: 'BTC', maxFraction: 8 };
        const amount = this.getPortfolioCoin(short).btcBalance;
        return formatCurrency(amount, opts)
    }

    portfolioRenderFIAT = (short) => {
        const self = this;
        const amount = this.getPortfolioCoin(short)[this.defaultCurrency.type];
        return formatCurrency(amount, self.formatFIAT)
    }

    get24hEvolution = (short) => {
        const coin = this.getCoin(short);
        return coin.perc;
    }

    portfolioTotal = () => {
        const self = this;
        /* call reduce() on the array, passing a callback
        that adds all the values together */
        const amount = self.portfolio.reduce((accumulator, coin) => accumulator + coin[self.defaultCurrency.type], 0);
        return formatCurrency(amount, self.formatFIAT)
    }
}
