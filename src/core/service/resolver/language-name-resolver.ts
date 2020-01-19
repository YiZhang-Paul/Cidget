import { injectable, inject, named } from 'inversify';

import Types from '../../ioc/types';

import NameResolverBase from './name-resolver.base';

@injectable()
export default class LanguageNameResolver extends NameResolverBase {

    constructor(@inject(Types.ResolverType) @named('language') category: string) {
        super(category);
    }
}
