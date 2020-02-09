const express = require('express');
const { BrowserWindow } = require('electron').remote;
const { clientId, secret, callback, scope, tokenHost, authorizePath, tokenPath } = require('config').outlook;

const app = express();
const client = { id: clientId, secret };
const auth = { tokenHost, authorizePath, tokenPath }
const oauth2 = require('simple-oauth2').create({ client, auth });
const window = new BrowserWindow({ width: 800, height: 600 });
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
