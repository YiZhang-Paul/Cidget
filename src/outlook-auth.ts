import config from 'config';
import express from 'express';
import { remote } from 'electron';

import Types from './core/ioc/types';
import Container from './core/ioc/container';
import IOAuthProvider from './core/interface/general/oauth-provider.interface';
import { logger } from './core/service/io/logger/logger';

const app = express();
const { localPort } = config.get<any>('mail').outlook;
const outlookApi = Container.get<IOAuthProvider>(Types.IOAuthProvider);
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
