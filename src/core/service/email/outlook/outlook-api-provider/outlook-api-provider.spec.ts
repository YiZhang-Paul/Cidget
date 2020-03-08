jest.mock('electron', () => ({
    remote: {
        BrowserWindow: class BrowserWindow { public loadUrl(): void { } }
    }
}));

jest.mock('simple-oauth2', () => ({
    create(): any {
        return ({
            authorizationCode: {
                authorizeURL(): string { return ''; },
                getToken(): any { return ({ access_token: 'access_token' }); }
            },
            accessToken: {
                create(): any {
                    return ({
                        token: { access_token: 'access_token' },
                        expired(): boolean { return true },
                        async refresh(): Promise<any> {
                            return ({ access_token: 'refreshed_access_token' });
                        }
                    });
                }
            }
        });
    }
}));

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import AppSettings from '../../../io/app-settings/app-settings';

import OutlookApiProvider from './outlook-api-provider';

describe('outlook api provider service unit test', () => {
    const tokenPath = 'mail.outlook.token';
    let service: OutlookApiProvider;
    let appSettings: AppSettings;

    beforeEach(() => {
        appSettings = Container.get<AppSettings>(Types.AppSettings);
        service = Container.get<OutlookApiProvider>(Types.OutlookApiProvider);

        appSettings.set(tokenPath, {});
    });

    describe('authorize', () => {
        test('should store token', async () => {
            await service.authorize('');

            expect(appSettings.get(tokenPath).access_token).toBe('access_token');
        });
    });

    describe('startGraphRequest', () => {
        test('should refresh access token', async () => {
            await service.startGraphRequest('');

            expect(appSettings.get(tokenPath).access_token).toBe('refreshed_access_token');
        });
    });
});
