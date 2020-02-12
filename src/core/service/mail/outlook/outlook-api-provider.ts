import 'isomorphic-fetch';
import { injectable } from 'inversify';
import { remote, BrowserWindow } from 'electron';
import * as graph from '@microsoft/microsoft-graph-client';

import config from '../../../../electron-config';
import IUser from '../../../interface/general/user.interface';
import IMail from '../../../interface/general/email.interface';
import IOAuthProvider from '../../../interface/general/oauth-provider.interface';
import { logger } from '../../io/logger/logger';

const outlookConfig = config.get('mail.outlook');
const { clientId, secret, callback, scope } = outlookConfig;
const { tokenHost, authorizePath, tokenPath } = outlookConfig;
const client = { id: clientId, secret };
const auth = { tokenHost, authorizePath, tokenPath };
const oauth2 = require('simple-oauth2').create({ client, auth });

@injectable()
export default class OutlookApiProvider implements IOAuthProvider {
    private _tokenPath = 'mail.outlook.token';
    private _token!: any;
    private _client!: graph.Client;
    private _window!: BrowserWindow;

    constructor() {
        this.authorizeToken(config.get(this._tokenPath));
    }

    private get authorizeContext(): any {
        return ({ redirect_uri: callback, scope });
    }

    public promptAuthorization(): void {
        const url = oauth2.authorizationCode.authorizeURL(this.authorizeContext);
        this._window = new remote.BrowserWindow({ width: 800, height: 600 });
        this._window.loadURL(url);
    }

    public async authorize(code: string): Promise<void> {
        const context = Object.assign({ code }, this.authorizeContext);
        const token = await oauth2.authorizationCode.getToken(context);
        // FIXME: potential loop
        this.authorizeToken(token);
        config.set(this._tokenPath, token);
        this._window.close();
    }

    private authorizeToken(token: any): void {
        try {
            this._token = oauth2.accessToken.create(token);
            const accessToken = this._token.token.access_token;
            this._client = graph.Client.init({ authProvider: _ => _(null, accessToken) });
        }
        catch {
            this.promptAuthorization();
        }
    }

    private async refreshToken(): Promise<void> {
        if (!this._token.expired()) {
            return;
        }

        try {
            this._token.token = await this._token.refresh();
            config.set(this._tokenPath, this._token.token);
        }
        catch {
            this.promptAuthorization();
        }
    }

    public async getMails(): Promise<IMail[]> {
        try {
            await this.refreshToken();

            const mails = await this._client
                .api('/me/messages')
                .top(500)
                .select('subject,body,sender,from,toRecipients,createdDateTime')
                .orderby('createdDateTime DESC')
                .get();

            return mails.value.map(this.toMail.bind(this));
        }
        catch (error) {
            logger.log(error);

            return [];
        }
    }

    public toMail(data: any): IMail {
        const { subject, body, createdDateTime, from, toRecipients } = data;

        return ({
            subject: subject,
            body: body.content,
            created: new Date(createdDateTime),
            from: this.getUser(from),
            to: toRecipients.map(this.getUser.bind(this))
        }) as IMail;
    }

    private getUser(data: any): IUser {
        const { emailAddress } = data;

        return ({
            name: emailAddress.name,
            email: emailAddress.address
        });
    }
}
