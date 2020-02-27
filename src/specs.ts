import Container from './core/ioc/container';
import getData from './mocks/third-party/electron-store';

const mockData = getData();

jest.mock('electron-store', () => class ElectronStoreStub {

    public get(key: string): any {
        return mockData[key];
    }

    public set(key: string, value: any): void {
        mockData[key] = value;
    }
});

beforeEach(() => Container.snapshot());
afterEach(() => Container.restore());
