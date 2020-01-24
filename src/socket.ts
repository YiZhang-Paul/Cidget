import socketClient from 'socket.io-client';

import Store from './store';
import { logger } from './core/service/io/logger/logger';

const socket = socketClient('http://localhost:8888');
socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));

socket.on('azure-devops-build', (payload: any) => {
    const action = `${Store.azureDevopsStoreName}/addCiBuild`;
    Store.store.dispatch(action, payload);
});

socket.on('github-push', (data: any) => {
    const action = `${Store.githubStoreName}/addCommit`;
    const payload = JSON.parse(data.payload);
    Store.store.dispatch(action, payload);
});

socket.on('github-pull-request', (payload: any) => {
    const action = `${Store.githubStoreName}/addPullRequest`;
    Store.store.dispatch(action, payload);
});
