import * as config from 'config';

import IAbbreviationResolver from '../../../core/interface/general/abbreviation-resolver.interface';

export default class LicenseNameResolver implements IAbbreviationResolver {
    private _lookup = new Map<string, string>();

    constructor() {
        const input = config.get<any>('abbreviations').license;

        for (const abbreviation of Object.keys(input)) {
            for (const license of input[abbreviation]) {
                this._lookup.set(license, abbreviation);
            }
        }
    }

    public resolve(name = ''): string {
        return this._lookup.get(name.toLowerCase()) ?? '';
    }
}
