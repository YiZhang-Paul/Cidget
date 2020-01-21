import Types from '../../../ioc/types';
import Container from '../../../ioc/container';

import LicenseNameResolver from './license-name-resolver';

describe('license name resolver unit test', () => {
    let resolver: LicenseNameResolver;

    beforeEach(() => {
        resolver = Container.get<LicenseNameResolver>(Types.LicenseNameResolver);
    });

    describe('resolve', () => {
        test('should return abbreviation found', () => {
            expect(resolver.resolve('MIT License')).toBe('MIT');
        });

        test('should return N/A when no abbreviation found', () => {
            expect(resolver.resolve('ABC License')).toBe('N/A');
        });

        test('should return N/A on default', () => {
            expect(resolver.resolve()).toBe('N/A');
        });
    });
});
