import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';
import LoaderStore from './LoaderStore';
import NotifierStore from './NotifierStore';
import PortfolioStore from './PortfolioStore'

export default class AppStore {
  @observable name = ''

    constructor() {
        this.notifier = new NotifierStore();
        this.loader = new LoaderStore();
        this.portfolio = new PortfolioStore({
            defaultFiat: { type: 'usd', symbol: '$' }
        });

        ipcRenderer.on('event', (e, { data }) => {

        });
    }

  @action func = () => {
      ipcRenderer.send('evnt', { data });
      this.loader.updateLoading({ type: 'add', key: 4 });
  }

}
