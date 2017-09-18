import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';


const formatCurrency = require('format-currency')


import { colors } from '../constants'

export default class PortfolioStore {
     @observable portfolio = [];

     @observable fiatRates = {
         eur: 3000,
         usd: 4000
     }

     @observable defaultCurrency = {};

    colors = colors;

    constructor({ defaultFiat, defaultCrypto, marketStore }) {
        this.market = marketStore;
        this.defaultCurrency = defaultFiat;
        this.defaultCrypto = defaultCrypto;
        this.formatFIAT = { format: '%s%v', symbol: this.defaultCurrency.symbol }
        this.formatCrypto = { format: '%v %c', code: defaultCrypto, maxFraction: 8 };

        const self = this;

        ipcRenderer.on('initializePortfolio', (e, { portfolio }) => { self.initializePortfolio(portfolio) });
        ipcRenderer.on('portfolioUpdate', () => { self.portfolioUpdate() });
    }

    getCoin = (short) => this.market.getMarket().filter((coin) => coin.short === short)[0];
    getPortfolioCoin = (short) => this.portfolio.filter((coin) => coin.short === short)[0];

    @action initializePortfolio = (portfolio) => { this.portfolio = portfolio }

    @action portfolioUpdate = () => {
        const self = this;
        // update porfolio valuation in term of BTC
        // copy and slice observable in order to update at the end of the process the values
        const updatedPorfolio = self.portfolio.slice();
        updatedPorfolio.forEach(({ short }, key) => {
            const market = self.getCoin(short);
            const btc = self.getCoin('BTC');
            updatedPorfolio[key].btcBalance = (self.portfolio[key].balance * market.price) / btc.price;
            updatedPorfolio[key].usd = self.portfolio[key].balance * market.price;
            updatedPorfolio[key].perc = market.perc;
        });

        this.portfolio = updatedPorfolio;
    }

    portfolioRenderBalance = (short) => {
        const opts = { format: '%v %c', code: short, maxFraction: 8 };
        return formatCurrency(this.getPortfolioCoin(short).balance, opts)
    }

    portfolioRenderBTC = (short) => {
        const self = this;
        const amount = this.getPortfolioCoin(short).btcBalance;
        return formatCurrency(amount, self.formatCrypto)
    }

    portfolioRenderFIAT = (short) => {
        const self = this;
        const amount = this.getPortfolioCoin(short)[this.defaultCurrency.type];
        return formatCurrency(amount, self.formatFIAT)
    }

    get24hEvolution = (short) => {
        const coin = this.getPortfolioCoin(short);
        return coin.perc;
    }

    portfolioTotal = (format = true) => {
        const self = this;
        /* call reduce() on the array, passing a callback
        that adds all the values together */
        const amount = self.portfolio.reduce((accumulator, coin) => accumulator + coin[self.defaultCurrency.type], 0);
        if (format) {
            return formatCurrency(amount, self.formatFIAT)
        }

        return amount;
    }

    portfolioEvolution = () => {
        const self = this;
        const total = self.portfolio.reduce((accumulator, coin) => accumulator + ((coin[self.defaultCurrency.type] * coin.perc) / 100), 0);
        return ((total / this.portfolioTotal(false)) * 100).toFixed(2);
    }

    portfolioTotalBtc = (short = this.defaultCrypto) => {
        const self = this;
        const total = this.portfolioTotal(false);
        const coinValue = this.getCoin(short).price;
        return formatCurrency(total / coinValue, self.formatCrypto)
    }
}
