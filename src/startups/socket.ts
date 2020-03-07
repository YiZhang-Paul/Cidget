import socketClient from 'socket.io-client';

import Store from '../store';
import Types from '../core/ioc/types';
import Container from '../core/ioc/container';
import { logger } from '../core/service/io/logger/logger';
import OutlookApiProvider from '../core/service/mail/outlook/outlook-api-provider';
import ZendeskTicketEmailProvider from '../core/service/customer-support/zendesk/zendesk-ticket-email-provider.service';
import AppSettings from '../core/service/io/app-settings/app-settings';

const outlookService = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);
const zendeskService = Container.get<ZendeskTicketEmailProvider>(Types.ZendeskTicketEmailProvider);
const settings = Container.get<AppSettings>(Types.AppSettings);
const socket = socketClient(settings.get('cidget.server').host);

socket.on('connect', () => logger.log('socket connected.'));
socket.on('disconnect', () => logger.log('socket disconnected.'));

socket.on('outlook-mail', async (payload: any) => {
    try {
        const id = payload.value[0].resourceData['@odata.id'];
        const request = await outlookService.startGraphRequest(id);
        const mail = outlookService.toMail(await request?.get());

        if (zendeskService.isZendeskEmail(mail)) {
            const action = `${Store.zendeskStoreName}/addTicketFromMail`;
            Store.store.dispatch(action, zendeskService.toTicket(mail));
        }
    }
    catch (error) {
        logger.log(error);
    }
});

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

socket.on('github-pull-request-review', (payload: any) => {
    const action = `${Store.githubStoreName}/addPullRequestReview`;
    Store.store.dispatch(action, payload);
});

socket.on('github-pull-request-check', (payload: any) => {
    const action = `${Store.githubStoreName}/addPullRequestCheck`;
    Store.store.dispatch(action, payload);
});
