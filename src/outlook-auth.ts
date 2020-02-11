import express from 'express';
import { remote } from 'electron';

import config from './electron-store';
import Types from './core/ioc/types';
import Container from './core/ioc/container';
import { logger } from './core/service/io/logger/logger';
import OutlookApiProvider from './core/service/mail/outlook/outlook-api-provider';

const app = express();
const { localPort } = config.get('mail').outlook;
const outlookApi = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);
const window = new remote.BrowserWindow({ width: 800, height: 600 });

app.listen(localPort, () => logger.log(`outlook OAuth server listening on port ${localPort}.`));
window.loadURL(outlookApi.authorizeUrl);

app.get('/auth/outlook', async (req, res) => {
    const { code } = req.query;

    if (code) {
        await outlookApi.authorize(code);
    }
    window.close();
    res.sendStatus(200);
});
