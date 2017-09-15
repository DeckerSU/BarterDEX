import log from 'electron-log';
// import LivepeerEmitter from 'LivepeerEmitter';
import { main } from './config/config';

const EventEmitter = require('events');

// export const LivePeerAPI = () => new LivepeerEmitter({ config: main, log });
class LivepeerEmitter extends EventEmitter {
    constructor({ config, log }) {
        super();
    }
}

export const LivePeerAPI = () => new LivepeerEmitter({ config: main, log });
