import { injectable, inject, named } from 'inversify';

import Types from '../../../ioc/types';
import NameResolverBase from '../name-resolver.base';

@injectable()
export default class LicenseNameResolver extends NameResolverBase {

    constructor(@inject(Types.ResolverType) @named('license') category: string) {
        super(category);
    }
}
