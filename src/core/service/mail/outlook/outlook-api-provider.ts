import config from 'config';
import { injectable } from 'inversify';

import IOAuthProvider from '../../../interface/general/oauth-provider.interface';

const outlookConfig = config.get<any>('mail').outlook;
const { clientId, secret, callback, scope } = outlookConfig;
const { tokenHost, authorizePath, tokenPath } = outlookConfig;
const client = { id: clientId, secret };
const auth = { tokenHost, authorizePath, tokenPath };
const oauth2 = require('simple-oauth2').create({ client, auth });

@injectable()
export default class OutlookApiProvider implements IOAuthProvider {
    private _token: any = null;

    private get authorizeContext(): any {
        return ({ redirect_uri: callback, scope });
    }

    public get authorizeUrl(): string {
        return oauth2.authorizationCode.authorizeURL(this.authorizeContext);
    }

    public async authorize(code: string): Promise<void> {
        const context = Object.assign({ code }, this.authorizeContext);
        const token = await oauth2.authorizationCode.getToken(context);
        this._token = oauth2.accessToken.create(token);
    }
}
