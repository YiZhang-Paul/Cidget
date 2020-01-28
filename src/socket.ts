import socketClient from 'socket.io-client';

import Store from './store';
import { logger } from './core/service/io/logger/logger';

const { host } = require('config').get('cidget').server;
const socket = socketClient(host);
socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));

socket.on('azure-devops-build', (payload: any) => {
    const action = `${Store.azureDevopsStoreName}/addCiBuild`;
    Store.store.dispatch(action, payload);
});

socket.on('azure-devops-release', (payload: any) => {
    const action = `${Store.azureDevopsStoreName}/addCdRelease`;
    Store.store.dispatch(action, payload);
});

socket.on('github-push', (payload: any) => {
    const action = `${Store.githubStoreName}/addCommit`;
    Store.store.dispatch(action, payload);
});

socket.on('github-pull-request', (payload: any) => {
    const action = `${Store.githubStoreName}/addPullRequest`;
    Store.store.dispatch(action, payload);
});
