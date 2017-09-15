import log from 'electron-log';
import { main } from './config/config';

const EventEmitter = require('events');

class Emitter extends EventEmitter {
    constructor({ config, log }) {
        super();
    }
    startIguana() {
        this.emit('iguanaStarted');
    }
}

export const API = () => new Emitter({ config: main, log });
