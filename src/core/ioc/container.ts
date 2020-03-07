import 'reflect-metadata';
import { Container } from 'inversify';

import IHttpClient from '../interface/generic/http-client.interface';
import IRepositoryProvider from '../interface/source-control/repository-provider.interface';
import HttpClient from '../service/io/http-client/http-client';
import OutlookApiProvider from '../service/mail/outlook/outlook-api-provider';
import OutlookWebhookProvider from '../service/webhook/outlook/outlook-webhook-provider';
import ZendeskTicketEmailProvider from '../service/customer-support/zendesk/zendesk-ticket-email-provider.service';
import GithubRepositoryProvider from '../service/repository/github/github-repository-provider/github-repository-provider.service';
import GithubWebhookProviderService from '../service/webhook/github/github-webhook-provider.service';
import GithubCommitService from '../service/repository/github/github-commit/github-commit.service';
import GithubPullRequestService from '../service/repository/github/github-pull-request/github-pull-request.service';
import AzureDevopsWebhookProviderService from '../service/webhook/azure-devops/azure-devops-webhook-provider.service';
import AzureDevopsCiBuildService from '../service/pipeline/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../service/pipeline/azure-devops/azure-devops-cd-release/azure-devops-cd-release.service';
import AzureDevopsApiProvider from '../service/devops/azure-devops/azure-devops-api-provider/azure-devops-api-provider.service';
import AzureDevopsPipelineProvider from '../service/devops/azure-devops/azure-devops-pipeline-provider/azure-devops-pipeline-provider.service';
import AppSettings from '../service/io/app-settings/app-settings';

import Types from './types';

const container = new Container();

container
    .bind<IHttpClient>(Types.IHttpClient)
    .to(HttpClient)
    .inSingletonScope();

container
    .bind<IRepositoryProvider<any>>(Types.IRepositoryProvider)
    .to(GithubRepositoryProvider)
    .inSingletonScope()
    .whenTargetNamed('github');

container
    .bind<OutlookApiProvider>(Types.OutlookApiProvider)
    .to(OutlookApiProvider)
    .inSingletonScope();

container
    .bind<OutlookWebhookProvider>(Types.OutlookWebhookProvider)
    .to(OutlookWebhookProvider)
    .inSingletonScope();

container
    .bind<ZendeskTicketEmailProvider>(Types.ZendeskTicketEmailProvider)
    .to(ZendeskTicketEmailProvider)
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
    .bind<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService)
    .to(AzureDevopsCiBuildService)
    .inSingletonScope();

container
    .bind<AzureDevopsCdReleaseService>(Types.AzureDevopsCdReleaseService)
    .to(AzureDevopsCdReleaseService)
    .inSingletonScope();

container
    .bind<AzureDevopsWebhookProviderService>(Types.AzureDevopsWebhookProviderService)
    .to(AzureDevopsWebhookProviderService)
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
    .bind<AppSettings>(Types.AppSettings)
    .to(AppSettings)
    .inSingletonScope();

export default container;
