jest.mock('electron-store', () => class ElectronStoreStub {
    private _data: any = {
    };

    public get(key: string): any {
        return this._data[key];
    }

    public set(key: string, value: any): void {
        this._data[key] = value;
    }
});

import Container from './core/ioc/container';

beforeEach(() => {
    Container.snapshot();
    jest.useFakeTimers();
});

afterEach(() => {
    Container.restore();
    jest.useRealTimers();
});
