import * as config from 'config';
import { injectable } from 'inversify';

import IAbbreviationResolver from '../../interface/general/abbreviation-resolver.interface';

@injectable()
export default abstract class NameResolverBase implements IAbbreviationResolver {
    private _lookup = new Map<string, string>();

    constructor(category: string) {
        const input = config.get<any>('abbreviations')[category];

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
