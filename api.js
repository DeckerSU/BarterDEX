import log from 'electron-log';
import request from 'request';
import { main } from './config/config';
import io from 'socket.io-client';

const EventEmitter = require('events');

class Emitter extends EventEmitter {
    constructor({ config, log }) {
        super();
        const self = this;
        /* subscribe to updates */
        const socket = io.connect('http://socket.coincap.io');
        socket.on('trades', (msg) => {
            self.emit('trades', { trades: msg });
        })
    }
    getPortfolio() {
        const portfolio = [
            { name: 'Komodo', short: 'KMD', balance: 17480.85108539, evolution: 40.1 },
            { name: 'Bitcoin', short: 'BTC', balance: 0.2, evolution: 20.1 },
            { name: 'Ethereum', short: 'ETH', balance: 10, evolution: -0.1 },
            { name: 'Neo', short: 'NEO', balance: 100, evolution: -0.1 },
            { name: 'Litecoin', short: 'LTC', balance: 100, evolution: -0.1 }
        ];
        this.emit('initializePortfolio', { portfolio });
    }
    marketLoop() {
        const self = this;
        request('http://coincap.io/front', (error, response, body) => {
            self.emit('marketUpdate', { data: JSON.parse(body) });
        });
    }
    startIguana() {
        this.emit('iguanaStarted');
    }
}

export const API = () => new Emitter({ config: main, log });
