import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ICiBuild from '../../core/interface/devops/ci/ci-build.interface';
import ICdRelease from '../../core/interface/devops/cd/cd-release.interface';
import AzureDevopsCiBuildService from '../../core/service/devops/azure-devops/azure-devops-ci-build/azure-devops-ci-build.service';
import AzureDevopsCdReleaseService from '../../core/service/devops/azure-devops/azure-devops-cd-release/azure-devops-cd-release.service';

import { createStore } from './azure-devops.store';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('azure devops store unit test', () => {
    let store: Store<any>;
    let notifySpy: any;
    let buildServiceStub: any;
    let releaseServiceStub: any;

    beforeEach(() => {
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
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CiBuild);
        });

        test('should trigger notification when build is updated', async () => {
            const updated = { id: '147', status: 'failed' };
            store.state.ciBuilds = [build];
            buildServiceStub.toCiBuild.resolves(updated);

            await store.dispatch('addCiBuild', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CiBuild);
        });
    });

    describe('manageCdRelease', () => {
        let release: any;

        beforeEach(() => {
            release = { id: '147', status: 'approved' };
            releaseServiceStub.toCdRelease.resolves(release);
        });

        test('should add release when it is not already included', async () => {
            store.state.cdReleases = [];

            await store.dispatch('manageCdRelease', {});

            expect(store.getters.getCdReleases.length).toBe(1);
            expect(store.getters.getCdReleases[0].id).toBe('147');
            expect(store.getters.getCdReleases[0].status).toBe('approved');
        });

        test('should update release when it is already included', async () => {
            const updated = { id: '147', status: 'queued' };
            store.state.cdReleases = [release];
            releaseServiceStub.toCdRelease.resolves(updated);

            await store.dispatch('manageCdRelease', {});

            expect(store.getters.getCdReleases.length).toBe(1);
            expect(store.getters.getCdReleases[0].id).toBe('147');
            expect(store.getters.getCdReleases[0].status).toBe('queued');
        });

        test('should trigger notification when release is added', async () => {
            store.state.cdReleases = [];

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CdRelease);
        });

        test('should trigger notification when release is updated', async () => {
            const updated = { id: '147', status: 'queued' };
            store.state.cdReleases = [release];
            releaseServiceStub.toCdRelease.resolves(updated);

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CdRelease);
        });

        test('should not trigger notification for succeeded status when last stage is not succeeded', async () => {
            release.status = 'succeeded';

            release.stages = [
                { name: 'stage_1', status: 'succeeded' },
                { name: 'stage_2', status: 'inProgress' }
            ];

            await store.dispatch('manageCdRelease', {});

            sinonExpect.notCalled(notifySpy);
        });

        test('should trigger notification for succeeded status when last stage is also succeeded', async () => {
            release.status = 'succeeded';

            release.stages = [
                { name: 'stage_1', status: 'succeeded' },
                { name: 'stage_2', status: 'succeeded' }
            ];

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CdRelease);
        });

        test('should trigger notification for succeeded status when stage information is not available', async () => {
            release.status = 'succeeded';
            release.stages = null;

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CdRelease);
        });

        test('should trigger notification for succeeded status when stage information is empty', async () => {
            release.status = 'succeeded';
            release.stages = [];

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(4500);
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.type).toBe(NotificationType.CdRelease);
        });

        test('should trigger persistent notification when release needs approval', async () => {
            release.status = 'needs approval';
            store.state.cdReleases = [];

            await store.dispatch('manageCdRelease', {});

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].duration).toBe(-1);
        });

        test('should add auto notification when release is approved', async () => {
            jest.useFakeTimers();
            store.state.cdReleases = [];

            await store.dispatch('manageCdRelease', { resource: { approval: {} } });

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
        test('should not add auto notification when another event happens during delay', async () => {
            const release = { id: '147', status: 'approved' };

            jest.useFakeTimers();
            releaseServiceStub.toCdRelease.resolves(Object.assign({ id: '147', status: 'rejected' }));
            store.state.cdReleases = [];

            store.dispatch('notifyApproval', release);
            await store.dispatch('manageCdRelease', {});
            jest.advanceTimersByTime(4000);

            sinonExpect.calledOnce(notifySpy);
            expect(store.state.cdReleases.length).toBe(1);
            expect(store.state.cdReleases[0].status).toBe('rejected');
        });
    });
});
