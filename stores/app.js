import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';
import LoaderStore from './LoaderStore';
import NotifierStore from './NotifierStore';
import PortfolioStore from './PortfolioStore'
import MarketStore from './MarketStore'

export default class AppStore {
  @observable name = ''

    constructor() {
        this.notifier = new NotifierStore();
        this.loader = new LoaderStore();
        this.market = new MarketStore();

        this.portfolio = new PortfolioStore({
            defaultFiat: { type: 'usd', symbol: '$' },
            defaultCrypto: 'BTC',
            marketStore: this.market
        });

        ipcRenderer.on('event', (e, { data }) => {

        });
    }

  @action func = () => {
      ipcRenderer.send('evnt', { data });
      this.loader.updateLoading({ type: 'add', key: 4 });
  }

}
