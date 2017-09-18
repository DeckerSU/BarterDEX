import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';

export default class PortfolioStore {

     @observable market = {};


    constructor() {
        const self = this;
        ipcRenderer.on('marketUpdate', (e, { data }) => { self.updateMarket(data) });
        ipcRenderer.on('trades', (e, { trades }) => {
            if (trades.coin === 'KMD') {
                // console.log(trades);
            }
        });
    }

    @action updateMarket = (data) => {
        this.market = data;
    }

    @action getMarket = () => this.market

}
