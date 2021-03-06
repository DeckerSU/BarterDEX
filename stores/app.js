import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';
import LoaderStore from './LoaderStore';
import NotifierStore from './NotifierStore';
import PortfolioStore from './PortfolioStore'
import OrderbookStore from './OrderbookStore'

const shepherdIPC = (data) => { ipcRenderer.send('shepherd-command', data) }

export default class AppStore {

  @observable userpass = false;
  @observable coins = false;
  @observable mypubkey = false;

    constructor() {
        const self = this;
        this.notifier = new NotifierStore();
        this.loader = new LoaderStore();
        this.orderbook = new OrderbookStore();

        this.portfolio = new PortfolioStore({
            defaultFiat: { type: 'usd', symbol: '$' },
            defaultCrypto: 'KMD',
            orderbookStore: this.orderbook
        });

        /* set userpass */
        ipcRenderer.on('updateUserInfo', (e, { userpass, coins, mypubkey }) => {
            self.coins = coins;
            self.userpass = userpass;
            self.mypubkey = mypubkey;
        });

        ipcRenderer.on('resetUserInfo', () => {
            self.coins = '';
            self.userpass = '';
            self.mypubkey = '';
        })

        // shepherdIPC({ command: 'logout' });
    }

  @action login = (passphrase) => {
      // send login passphrase
      shepherdIPC({ command: 'login', passphrase });
  }

  @action logout = () => {
      // send login passphrase
      this.portfolio.leave();
      shepherdIPC({ command: 'logout' });
  }

}
