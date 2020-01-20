import 'reflect-metadata';
import Vuex, { Store } from "vuex";
import { createLocalVue } from '@vue/test-utils';
import { expect } from 'chai';
import { stub } from 'sinon';

import Types from '../../../src/core/ioc/types';
import Container from '../../../src/core/ioc/container';
import { createStore } from '../../../src/store/github/github.store';
import IGithubUser from '../../../src/core/interface/repository/github/github-user.interface';
import ICommit from '../../../src/core/interface/general/commit.interface';
import IPullRequest from '../../../src/core/interface/general/pull-request.interface';
import GithubCommitService from '../../../src/core/service/repository/github/github-commit.service';
import GithubPullRequestService from '../../../src/core/service/repository/github/github-pull-request.service';

createLocalVue().use(Vuex);

context('github store unit test', () => {
    let store: Store<any>;
    let commitServiceStub: any;
    let pullRequestServiceStub: any;

    beforeEach('stub setup', () => {
        Container.snapshot();

        commitServiceStub = stub({
            async toCommit(_: any): Promise<ICommit<IGithubUser>> {
                return ({} as ICommit<IGithubUser>);
            }
        } as GithubCommitService);

        pullRequestServiceStub = stub({
            async toPullRequest(_: any): Promise<IPullRequest<IGithubUser>> {
                return ({} as IPullRequest<IGithubUser>);
            }
        } as GithubPullRequestService);

        Container
            .rebind<GithubCommitService>(Types.GithubCommitService)
            .toConstantValue(commitServiceStub);

        Container
            .rebind<GithubPullRequestService>(Types.GithubPullRequestService)
            .toConstantValue(pullRequestServiceStub);
    });

    beforeEach('test setup', () => {
        store = new Store(createStore());
    });

    afterEach('test teardown', () => {
        Container.restore();
    });

    describe('addCommit', () => {
        it('should add commit when it is not already included', async () => {
            const commit = { id: '147', initiator: { name: 'john' } };
            commitServiceStub.toCommit.resolves(commit);
            store.state.commit = [];

            await store.dispatch('addCommit', {});

            expect(store.state.commit.length).to.equal(1);
            expect(store.state.commit[0].id).to.equal('147');
            expect(store.state.commit[0].initiator.name).to.equal('john');
        });

        it('should ', () => {});
        it('should ', () => {});
        it('should ', () => {});
    });
});
