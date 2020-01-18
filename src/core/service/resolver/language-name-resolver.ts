import * as config from 'config';

import IAbbreviationResolver from '../../../core/interface/general/abbreviation-resolver.interface';

export default class LanguageNameResolver implements IAbbreviationResolver {
    private _lookup = new Map<string, string>();

    constructor() {
        const input = config.get<any>('abbreviations').language;

        for (const abbreviation of Object.keys(input)) {
            for (const language of input[abbreviation]) {
                this._lookup.set(language, abbreviation);
            }
        }
    }

    public resolve(name = ''): string {
        return this._lookup.get(name.toLowerCase()) ?? '';
    }
}
