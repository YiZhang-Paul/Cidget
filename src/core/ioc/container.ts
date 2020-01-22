import 'reflect-metadata';
import { Container } from 'inversify';

import IHttpClient from '../interface/general/http-client.interface';
import IRepositoryProvider from '../interface/repository/repository-provider.interface';
import IAbbreviationResolver from '../interface/general/abbreviation-resolver.interface';
import HttpClient from '../service/io/http-client/http-client';
import LanguageNameResolver from '../service/resolver/language-name-resolver/language-name-resolver';
import LicenseNameResolver from '../service/resolver/license-name-resolver/license-name-resolver';
import GithubRepositoryProvider from '../service/repository/github/github-repository-provider/github-repository-provider.service';
import GithubWebhookProviderService from '../service/webhook/github/github.webhook-provider.service';
import GithubCommitService from '../service/repository/github/github-commit/github-commit.service';
import GithubPullRequestService from '../service/repository/github/github-pull-request/github-pull-request.service';
import AzureDevopsApiProvider from '../service/pipeline/azure-devops/azure-devops-api-provider/azure-devops-api-provider.service';
import AzureDevopsPipelineProvider from '../service/pipeline/azure-devops/azure-devops-pipeline-provider/azure-devops-pipeline-provider.service';

import Types from './types';

const container = new Container();

container
    .bind<IHttpClient>(Types.IHttpClient)
    .to(HttpClient)
    .inSingletonScope();

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
    .bind<LanguageNameResolver>(Types.LanguageNameResolver)
    .to(LanguageNameResolver)
    .inSingletonScope();

container
    .bind<LicenseNameResolver>(Types.LicenseNameResolver)
    .to(LicenseNameResolver)
    .inSingletonScope();

container
    .bind<GithubRepositoryProvider>(Types.GithubRepositoryProvider)
    .to(GithubRepositoryProvider)
    .inSingletonScope();

container
    .bind<GithubWebhookProviderService>(Types.GithubWebhookProviderService)
    .to(GithubWebhookProviderService)
    .inSingletonScope();

container
    .bind<GithubCommitService>(Types.GithubCommitService)
    .to(GithubCommitService)
    .inSingletonScope();

container
    .bind<GithubPullRequestService>(Types.GithubPullRequestService)
    .to(GithubPullRequestService)
    .inSingletonScope();

container
    .bind<AzureDevopsApiProvider>(Types.AzureDevopsApiProvider)
    .to(AzureDevopsApiProvider)
    .inSingletonScope();

container
    .bind<AzureDevopsPipelineProvider>(Types.AzureDevopsPipelineProvider)
    .to(AzureDevopsPipelineProvider)
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
