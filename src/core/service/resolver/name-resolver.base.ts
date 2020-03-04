import { injectable } from 'inversify';

import IAbbreviationResolver from '../../interface/generic/abbreviation-resolver.interface';
import AppSettings from '../io/app-settings/app-settings';

@injectable()
export default abstract class NameResolverBase implements IAbbreviationResolver {
    private _lookup = new Map<string, string>();

    constructor(category: string, settings: AppSettings) {
        const input = settings.get('abbreviations')[category];

        for (const abbr of Object.keys(input)) {
            for (const value of input[abbr]) {
                this._lookup.set(value, abbr);
            }
        }
    }

    public resolve(name = ''): string {
        return this._lookup.get(name.toLowerCase()) ?? 'N/A';
    }
}
