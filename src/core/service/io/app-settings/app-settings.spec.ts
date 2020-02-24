jest.mock('electron-store', () => class ElectronStoreStub {
    private _data: any = {};

    public get(key: string): any {
        return this._data[key];
    }

    public set(key: string, value: any): void {
        this._data[key] = value;
    }
});

import Types from '../../../ioc/types';
import Container from '../../../ioc/container';

import AppSettings from './app-settings';

describe('app settings service unit test', () => {
    let service: AppSettings;

    beforeEach(() => {
        service = Container.get<AppSettings>(Types.AppSettings);
    });

    test('should properly save/retrieve from data store', () => {
        expect(service.get('key_1')).toBeUndefined();

        service.set('key_1', 5);

        expect(service.get('key_1')).toBe(5);
    });
});
