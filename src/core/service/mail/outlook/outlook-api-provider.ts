import 'isomorphic-fetch';
import config from 'config';
import { injectable } from 'inversify';
import * as graph from '@microsoft/microsoft-graph-client';

import IUser from '../../../interface/general/user.interface';
import IMail from '../../../interface/general/email.interface';
import IOAuthProvider from '../../../interface/general/oauth-provider.interface';
import { logger } from '../../io/logger/logger';

const outlookConfig = config.get<any>('mail').outlook;
const { clientId, secret, callback, scope } = outlookConfig;
const { tokenHost, authorizePath, tokenPath } = outlookConfig;
const client = { id: clientId, secret };
const auth = { tokenHost, authorizePath, tokenPath };
const oauth2 = require('simple-oauth2').create({ client, auth });

@injectable()
export default class OutlookApiProvider implements IOAuthProvider {
    private _token!: any;
    private _client!: graph.Client;

    private get authorizeContext(): any {
        return ({ redirect_uri: callback, scope });
    }

    public get authorizeUrl(): string {
        return oauth2.authorizationCode.authorizeURL(this.authorizeContext);
    }

    private async refreshToken(): Promise<void> {
        if (this._token.expired()) {
            await this._token.refresh();
        }
    }

    public async authorize(code: string): Promise<void> {
        const context = Object.assign({ code }, this.authorizeContext);
        const token = await oauth2.authorizationCode.getToken(context);
        this._token = oauth2.accessToken.create(token);
        const accessToken = this._token.token.access_token;
        this._client = graph.Client.init({ authProvider: _ => _(null, accessToken) });
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
