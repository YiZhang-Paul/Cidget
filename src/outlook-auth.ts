import express from 'express';
import { remote } from 'electron';

import Types from './core/ioc/types';
import Container from './core/ioc/container';
import IOAuthProvider from './core/interface/general/oauth-provider.interface';

const app = express();
const outlookApi = Container.get<IOAuthProvider>(Types.IOAuthProvider);
const window = new remote.BrowserWindow({ width: 800, height: 600 });

app.listen(8889);
window.loadURL(outlookApi.authorizeUrl);

app.get('/auth/outlook', async (req, res) => {
    const { code } = req.query;

    if (code) {
        await outlookApi.authorize(code);
    }
    window.close();
    res.sendStatus(200);
});
