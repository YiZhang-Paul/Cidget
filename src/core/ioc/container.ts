import { Container } from 'inversify';

import IRepositoryProvider from '../interface/repository/repository-provider.interface';
import IAbbreviationResolver from '../interface/general/abbreviation-resolver.interface';
import LanguageNameResolver from '../service/resolver/language-name-resolver';
import LicenseNameResolver from '../service/resolver/license-name-resolver';
import GithubRepositoryProvider from '../service/repository/github/github-repository-provider.service';
import GithubCommitService from '../service/repository/github/github-commit.service';
import GithubPullRequestService from '../service/repository/github/github-pull-request.service';

import Types from './types';

const container = new Container();

container
    .bind<IAbbreviationResolver>(Types.IAbbreviationResolver)
    .to(LanguageNameResolver)
    .inSingletonScope()
    .whenTargetNamed('language')

container
    .bind<IAbbreviationResolver>(Types.IAbbreviationResolver)
    .to(LicenseNameResolver)
    .inSingletonScope()
    .whenTargetNamed('license')

container
    .bind<IRepositoryProvider<any>>(Types.IRepositoryProvider)
    .to(GithubRepositoryProvider)
    .inSingletonScope()
    .whenTargetNamed('github');

container
    .bind<GithubCommitService>(Types.GithubCommitService)
    .to(GithubCommitService)
    .inSingletonScope();

container
    .bind<GithubPullRequestService>(Types.GithubPullRequestService)
    .to(GithubPullRequestService)
    .inSingletonScope();

container
    .bind<string>(Types.ResolverType)
    .toConstantValue('language')
    .whenTargetNamed('language');

container
    .bind<string>(Types.ResolverType)
    .toConstantValue('license')
    .whenTargetNamed('license');

export default container;
