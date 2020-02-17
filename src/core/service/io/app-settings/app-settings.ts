import { injectable } from 'inversify';
import ElectronStore from 'electron-store';

const settings = new ElectronStore();

@injectable()
export default class AppSettings {

    public get(key: string): any {
        return settings.get(key);
    }

    public set(key: string, value: any): void {
        settings.set(key, value);
    }
}
