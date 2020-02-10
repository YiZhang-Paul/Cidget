import socketClient from 'socket.io-client';

import Store from './store';
import Types from './core/ioc/types';
import Container from './core/ioc/container';
import { logger } from './core/service/io/logger/logger';
import OutlookApiProvider from './core/service/mail/outlook/outlook-api-provider';
import ZendeskTicketByMailProvider from './core/service/customer-support/zendesk/zendesk-ticket-by-mail-provider.service';

const { host } = require('config').get('cidget').server;
const outlookService = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);
const zendeskService = Container.get<ZendeskTicketByMailProvider>(Types.ZendeskTicketByMailProvider);
const socket = socketClient(host);
socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));

socket.on('outlook-mail', (payload: any) => {
    const mail = outlookService.toMail(payload);

    if (zendeskService.isZendeskEmail(mail)) {
        const action = `${Store.zendeskStoreName}/addTicketFromMail`;
        Store.store.dispatch(action, zendeskService.toTicket(mail));
    }
})

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

socket.on('github-pull-request-check', (payload: any) => {
    const action = `${Store.githubStoreName}/addPullRequestCheck`;
    Store.store.dispatch(action, payload);
});
