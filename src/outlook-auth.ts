import config from 'config';
import express from 'express';
import { remote } from 'electron';

const app = express();
const outlookConfig = config.get<any>('mail').outlook;
const { clientId, secret, callback, scope, tokenHost, authorizePath, tokenPath } = outlookConfig;
const client = { id: clientId, secret };
const auth = { tokenHost, authorizePath, tokenPath }
const oauth2 = require('simple-oauth2').create({ client, auth });
const window = new remote.BrowserWindow({ width: 800, height: 600 });
const loginUrl = oauth2.authorizationCode.authorizeURL({ redirect_uri: callback, scope });

app.listen(8889);
window.loadURL(loginUrl);

app.get('/auth/outlook', async (req, res) => {
    const { code } = req.query;

    if (code) {
        const context = { code, redirect_uri: callback, scope };
        const result = await oauth2.authorizationCode.getToken(context);
        const token = oauth2.accessToken.create(result);
        window.close();
    }
    res.sendStatus(200);
});
