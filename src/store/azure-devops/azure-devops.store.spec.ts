import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import ICiBuild from '../../core/interface/pipeline/ci-build.interface';
import ICdRelease from '../../core/interface/pipeline/cd-release.interface';
import AzureDevopsCiBuildService from '../../core/service/pipeline/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../../core/service/pipeline/azure-devops/azure-devops-cd-release/azure-devops-cd-release.service';

import { createStore } from './azure-devops.store';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('azure devops store unit test', () => {
    let store: Store<any>;
    let notifySpy: any;
    let buildServiceStub: any;
    let releaseServiceStub: any;

    beforeEach(() => {
        Container.snapshot();

        buildServiceStub = stub({
            async toCiBuild(_: any): Promise<ICiBuild> { return ({} as ICiBuild); }
        } as AzureDevopsCiBuildService);

        releaseServiceStub = stub({
            async toCdRelease(_: any): Promise<ICdRelease> { return ({} as ICdRelease) }
        } as AzureDevopsCdReleaseService);

        Container
            .rebind<AzureDevopsCiBuildService>(Types.AzureDevopsCiBuildService)
            .toConstantValue(buildServiceStub);

        Container
            .rebind<AzureDevopsCdReleaseService>(Types.AzureDevopsCdReleaseService)
            .toConstantValue(releaseServiceStub);

        notifySpy = spy(Vue, 'notify');
        store = new Store(createStore());
    });

    afterEach(() => {
        Container.restore();
        notifySpy.restore();
        jest.useRealTimers();
    });

    describe('addCiBuild', () => {
        let build: any;

        beforeEach(() => {
            build = { id: '147', status: 'running' };
            buildServiceStub.toCiBuild.resolves(build);
        });

        test('should add build when it is not already included', async () => {
            store.state.ciBuilds = [];

            await store.dispatch('addCiBuild', {});

            expect(store.getters.getCiBuilds.length).toBe(1);
            expect(store.getters.getCiBuilds[0].id).toBe('147');
            expect(store.getters.getCiBuilds[0].status).toBe('running');
        });

        test('should update build when it is already included', async () => {
            const updated = { id: '147', status: 'failed' };
            store.state.ciBuilds = [build];
            buildServiceStub.toCiBuild.resolves(updated);

            await store.dispatch('addCiBuild', {});

            expect(store.getters.getCiBuilds.length).toBe(1);
            expect(store.getters.getCiBuilds[0].id).toBe('147');
            expect(store.getters.getCiBuilds[0].status).toBe('failed');
        });

        test('should trigger notification when build is added', async () => {
            store.state.ciBuilds = [];

            await store.dispatch('addCiBuild', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('ci-build');
        });

        test('should trigger notification when build is updated', async () => {
            const updated = { id: '147', status: 'failed' };
            store.state.ciBuilds = [build];
            buildServiceStub.toCiBuild.resolves(updated);

            await store.dispatch('addCiBuild', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('ci-build');
        });
    });

    describe('addCdRelease', () => {
        let release: any;

        beforeEach(() => {
            release = { id: '147', status: 'approved' };
            releaseServiceStub.toCdRelease.resolves(release);
        });

        test('should add release when it is not already included', async () => {
            store.state.cdReleases = [];

            await store.dispatch('addCdRelease', {});

            expect(store.getters.getCdReleases.length).toBe(1);
            expect(store.getters.getCdReleases[0].id).toBe('147');
            expect(store.getters.getCdReleases[0].status).toBe('approved');
        });

        test('should update release when it is already included', async () => {
            const updated = { id: '147', status: 'queued' };
            store.state.cdReleases = [release];
            releaseServiceStub.toCdRelease.resolves(updated);

            await store.dispatch('addCdRelease', {});

            expect(store.getters.getCdReleases.length).toBe(1);
            expect(store.getters.getCdReleases[0].id).toBe('147');
            expect(store.getters.getCdReleases[0].status).toBe('queued');
        });

        test('should trigger notification when release is added', async () => {
            store.state.cdReleases = [];

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('cd-release');
        });

        test('should trigger notification when release is updated', async () => {
            const updated = { id: '147', status: 'queued' };
            store.state.cdReleases = [release];
            releaseServiceStub.toCdRelease.resolves(updated);

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('cd-release');
        });

        test('should not trigger notification for succeeded status when last stage is not succeeded', async () => {
            release.status = 'succeeded';

            release.stages = [
                { name: 'stage_1', status: 'succeeded' },
                { name: 'stage_2', status: 'inProgress' }
            ];

            await store.dispatch('addCdRelease', {});

            sinonExpect.notCalled(notifySpy);
        });

        test('should trigger notification for succeeded status when last stage is also succeeded', async () => {
            release.status = 'succeeded';

            release.stages = [
                { name: 'stage_1', status: 'succeeded' },
                { name: 'stage_2', status: 'succeeded' }
            ];

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('cd-release');
        });

        test('should trigger notification for succeeded status when stage information is not available', async () => {
            release.status = 'succeeded';
            release.stages = null;

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('cd-release');
        });

        test('should trigger notification for succeeded status when stage information is empty', async () => {
            release.status = 'succeeded';
            release.stages = [];

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(12000);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe('cd-release');
        });

        test('should trigger persistent notification when release needs approval', async () => {
            release.status = 'needs approval';
            store.state.cdReleases = [];

            await store.dispatch('addCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
        });

        test('should add auto notification when release is approved', async () => {
            jest.useFakeTimers();
            releaseServiceStub.toCdRelease.onCall(0).resolves(release);
            releaseServiceStub.toCdRelease.onCall(1).resolves({ id: '147', status: 'in progress' });
            store.state.cdReleases = [];

            await store.dispatch('addCdRelease', { resource: { approval: {} } });

            sinonExpect.calledOnce(notifySpy);
            expect(store.state.cdReleases.length).toBe(1);
            expect(store.state.cdReleases[0].status).toBe('approved');

            jest.advanceTimersByTime(4000);

            sinonExpect.calledTwice(notifySpy);
            expect(store.state.cdReleases.length).toBe(1);
            expect(store.state.cdReleases[0].status).toBe('in progress');
        });
    });

    describe('notifyApproval', () => {
        let release: any;

        beforeEach(() => {
            jest.useFakeTimers();
            release = { id: '147', status: 'approved' };
        });

        test('should not add auto notification when another event happens during delay', async () => {
            releaseServiceStub.toCdRelease.resolves(Object.assign({ id: '147', status: 'rejected' }));
            store.state.cdReleases = [];

            store.dispatch('notifyApproval', release);
            await store.dispatch('addCdRelease', {});
            jest.advanceTimersByTime(4000);

            sinonExpect.calledTwice(notifySpy);
            expect(store.state.cdReleases.length).toBe(1);
            expect(store.state.cdReleases[0].status).toBe('rejected');
        });

        test('should throw error when status is invalid', () => {
            release.status = 'rejected';

            try {
                store.dispatch('notifyApproval', release);
            }
            catch {
                return;
            }
            throw new Error('should not reach this line.');
        });
    });
});
