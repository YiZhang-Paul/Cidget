import socketClient from 'socket.io-client';

import Store from './store';
import { logger } from './core/service/io/logger/logger';

const socket = socketClient('http://localhost:8888');
socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));

socket.on('data', (json: any) => {
    const action = `${Store.githubStoreName}/addCommit`;
    const payload = JSON.parse(json.payload);
    Store.store.dispatch(action, payload);
});
