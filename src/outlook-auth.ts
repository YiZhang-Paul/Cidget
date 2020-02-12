import express from 'express';

import config from './electron-config';
import Types from './core/ioc/types';
import Container from './core/ioc/container';
import { logger } from './core/service/io/logger/logger';
import OutlookApiProvider from './core/service/mail/outlook/outlook-api-provider';
import OutlookWebhookProvider from './core/service/webhook/outlook/outlook-webhook-provider';

const app = express();
const { localPort } = config.get('mail.outlook');
const outlookApi = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);
const outlookWebhook = Container.get<OutlookWebhookProvider>(Types.OutlookWebhookProvider);

app.listen(localPort, () => logger.log(`outlook OAuth server listening on port ${localPort}.`));
outlookWebhook.renewAllWebhooks();

app.get('/auth/outlook', async (req, res) => {
    const { code } = req.query;

    if (code) {
        await outlookApi.authorize(code);
    }
    res.sendStatus(200);
});
