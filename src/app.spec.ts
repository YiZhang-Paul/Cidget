jest.mock('electron', () => ({
    remote: { getCurrentWindow(): any { } }
}));

import VueNotification from 'vue-notification';
import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, stub } from 'sinon';
import { remote } from 'electron';

import Store from './store';
import App from './app';

const vue = createLocalVue();
vue.use(VueNotification);

describe('app component unit test', () => {
    let wrapper: Wrapper<App>;
    let moveTopStub: any;
    let getCurrentWindowStub: any;

    beforeEach(() => {
        moveTopStub = stub();
        getCurrentWindowStub = stub(remote, 'getCurrentWindow');
        getCurrentWindowStub.returns({ moveTop: moveTopStub });
        wrapper = mount(App, { localVue: vue, store: Store.store });
    });

    afterEach(() => {
        getCurrentWindowStub.restore();
        wrapper.destroy();
        jest.useRealTimers();
    });

    test('should create component instance', () => {
        expect(wrapper.vm).toBeTruthy();
    });

    test('should display build pipeline event notification', () => {
        Store.store.state[Store.azureDevopsStoreName].ciBuilds = [{ id: 'build_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'ci-build', id: 'build_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe('ci-build');
        expect(getList(wrapper)[0].data.id).toBe('build_id');
    });

    test('should display release pipeline event notification', () => {
        Store.store.state[Store.azureDevopsStoreName].cdReleases = [{ id: 'release_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'cd-release', id: 'release_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe('cd-release');
        expect(getList(wrapper)[0].data.id).toBe('release_id');
    });

    test('should display commit event notification', () => {
        Store.store.state[Store.githubStoreName].commits = [{ id: 'commit_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'commit', id: 'commit_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe('commit');
        expect(getList(wrapper)[0].data.id).toBe('commit_id');
    });

    test('should display pull request event notification', () => {
        Store.store.state[Store.githubStoreName].pullRequests = [{ id: 'pull_request_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe('pull-request');
        expect(getList(wrapper)[0].data.id).toBe('pull_request_id');
    });

    test('should add notifications for events with different ids', () => {
        Store.store.state[Store.githubStoreName].pullRequests = [
            { id: 'pull_request_id_1' },
            { id: 'pull_request_id_2' }
        ];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id_1' }
        });

        const notificationId = getList(wrapper)[0].id;

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id_2' }
        });

        expect(getList(wrapper).length).toBe(2);
        expect(getList(wrapper)[0].id).toBeGreaterThan(notificationId);
        expect(getList(wrapper)[0].data.type).toBe('pull-request');
        expect(getList(wrapper)[0].data.id).toBe('pull_request_id_2');
        expect(getList(wrapper)[1].id).toBe(notificationId);
        expect(getList(wrapper)[1].data.type).toBe('pull-request');
        expect(getList(wrapper)[1].data.id).toBe('pull_request_id_1');
    });

    test('should update existing notification for same event', () => {
        jest.useFakeTimers();
        const classListStub = stub({ add() {}, remove() {} });
        const elements = [{ classList: classListStub }, { classList: classListStub }];
        const getElementsStub = stub((global as any).document, 'getElementsByClassName');
        getElementsStub.returns(elements);
        Store.store.state[Store.githubStoreName].pullRequests = [{ id: 'pull_request_id', status: 'status_1' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id' }
        });

        const notificationId = getList(wrapper)[0].id;
        Store.store.state[Store.githubStoreName].pullRequests = [{ id: 'pull_request_id', status: 'status_2' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id' }
        });

        Store.store.state[Store.githubStoreName].pullRequests = [{ id: 'pull_request_id', status: 'status_3' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'pull-request', id: 'pull_request_id' }
        });

        jest.advanceTimersByTime(5000);
        getElementsStub.restore();

        sinonExpect.callCount(classListStub.remove, 2 * elements.length);
        sinonExpect.callCount(classListStub.add, 2 * elements.length);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].id).toBe(notificationId);
        expect(getList(wrapper)[0].data.type).toBe('pull-request');
        expect(getList(wrapper)[0].data.id).toBe('pull_request_id');
    });
});

function getList(wrapper: Wrapper<App>): any[] {
    return wrapper.vm['_cards'].$data.list;
}
