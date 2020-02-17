import { injectable, inject, named } from 'inversify';

import Types from '../../../ioc/types';
import NameResolverBase from '../name-resolver.base';
import AppSettings from '../../io/app-settings/app-settings';

@injectable()
export default class LicenseNameResolver extends NameResolverBase {

    constructor(
        @inject(Types.ResolverType) @named('license') category: string,
        @inject(Types.AppSettings) settings: AppSettings
    ) {
        super(category, settings);
    }
}
