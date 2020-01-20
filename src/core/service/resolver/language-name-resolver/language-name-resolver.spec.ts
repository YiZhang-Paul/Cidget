import Types from '../../../ioc/types';
import Container from '../../../ioc/container';

import LanguageNameResolver from './language-name-resolver';

describe('language name resolver unit test', () => {
    let resolver: LanguageNameResolver;

    beforeEach(() => {
        resolver = Container.get<LanguageNameResolver>(Types.LanguageNameResolver);
    });

    describe('resolve', () => {
        test('should return abbreviation found', () => {
            expect(resolver.resolve('TypeScript')).toBe('TS');
        });

        test('should return N/A when no abbreviation found', () => {
            expect(resolver.resolve('ABCScript')).toBe('N/A');
        });
    });
});
