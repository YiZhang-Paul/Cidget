import express from 'express';

import Types from '../core/ioc/types';
import Container from '../core/ioc/container';
import { logger } from '../core/service/io/logger/logger';
import OutlookApiProvider from '../core/service/mail/outlook/outlook-api-provider';
import OutlookWebhookProvider from '../core/service/webhook/outlook/outlook-webhook-provider';
import AppSettings from '../core/service/io/app-settings/app-settings';

const app = express();
const settings = Container.get<AppSettings>(Types.AppSettings);
const outlookApi = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);
const outlookWebhook = Container.get<OutlookWebhookProvider>(Types.OutlookWebhookProvider);
const { localPort } = settings.get('mail.outlook');

app.listen(localPort, () => logger.log(`outlook OAuth server listening on port ${localPort}.`));
outlookWebhook.renewAllWebhooks();

app.get('/auth/outlook', async (req, res) => {
    const { code } = req.query;

    if (code) {
        await outlookApi.authorize(code);
    }
    res.sendStatus(200);
});
