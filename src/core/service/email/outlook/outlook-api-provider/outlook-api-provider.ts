import 'isomorphic-fetch';
import { injectable, inject } from 'inversify';
import { remote, BrowserWindow } from 'electron';
import * as graph from '@microsoft/microsoft-graph-client';
import { GraphRequest } from '@microsoft/microsoft-graph-client';

import Types from '../../../../ioc/types';
import IOAuthProvider from '../../../../interface/generic/oauth-provider.interface';
import { logger } from '../../../io/logger/logger';
import AppSettings from '../../../io/app-settings/app-settings';
import TimeUtility from '../../../../utility/time-utility/time-utility';

const log = require('electron-log');

@injectable()
export default class OutlookApiProvider implements IOAuthProvider {
    private _tokenPath = 'mail.outlook.token';
    private _token!: any;
    private _client!: graph.Client;
    private _window!: BrowserWindow;
    private _oauth2: any;
    private _callback: string;
    private _scope: string;
    private _settings: AppSettings;

    constructor(@inject(Types.AppSettings) settings: AppSettings) {
        const config = settings.get('mail.outlook');
        const { clientId, secret, callback, scope, tokenHost, authorizePath, tokenPath } = config;
        const client = { id: clientId, secret };
        const auth = { tokenHost, authorizePath, tokenPath };
        this._callback = callback;
        this._scope = scope;
        this._settings = settings;
        this._oauth2 = require('simple-oauth2').create({ client, auth });
        this.authorizeToken(this._settings.get(this._tokenPath));
    }

    private get authorizeContext(): any {
        return ({ redirect_uri: this._callback, scope: this._scope });
    }

    public promptAuthorization(): void {
        const url = this._oauth2.authorizationCode.authorizeURL(this.authorizeContext);
        this._window = new remote.BrowserWindow({ width: 800, height: 600 });
        this._window.loadURL(url);
    }

    public async authorize(code: string): Promise<void> {
        const context = Object.assign({ code }, this.authorizeContext);
        const token = await this._oauth2.authorizationCode.getToken(context);
        token.created = new Date().toISOString();
        // FIXME: potential loop
        this.authorizeToken(token);
        this._settings.set(this._tokenPath, token);
        this._window?.close();
    }

    private authorizeToken(token: any): void {
        try {
            this.setExpireTime(token);
            this._token = this._oauth2.accessToken.create(token);
            const accessToken = this._token.token.access_token;
            this._client = graph.Client.init({ authProvider: _ => _(null, accessToken) });
        }
        catch {
            this.promptAuthorization();
        }
    }

    private setExpireTime(token: any): void {
        if (token.created) {
            const timestamp = new Date(token.created);
            const elapsed = TimeUtility.elapsedMilliseconds(timestamp) / 1000;
            token.expires_in = Math.max(token.expires_in - elapsed, 0);
            token.ext_expires_in = Math.max(token.ext_expires_in - elapsed, 0);
        }
    }

    private async refreshToken(): Promise<void> {
        if (!this._token.expired()) {
            return;
        }

        try {
            const token = await this._token.refresh();
            token.created = new Date().toISOString();
            this.authorizeToken(token);
            this._settings.set(this._tokenPath, token);
        }
        catch {
            this.promptAuthorization();
        }
    }

    public async startGraphRequest(url: string): Promise<GraphRequest | null> {
        try {
            await this.refreshToken();

            return this._client.api(url);
        }
        catch (error) {
            log.error(error);
            logger.log(error);

            return null;
        }
    }
}
