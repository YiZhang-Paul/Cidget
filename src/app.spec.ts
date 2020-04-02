jest.mock('electron', () => ({
    remote: { getCurrentWindow(): any { } }
}));

import VueNotification from 'vue-notification';
import { createLocalVue, mount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, stub } from 'sinon';
import { remote } from 'electron';

import NotificationType from './core/enum/notification-type.enum';
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

    test('should display support ticket event notification', () => {
        Store.store.state[Store.zendeskStoreName].tickets = [{ id: 'ticket_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.SupportTicket, id: 'ticket_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.SupportTicket);
        expect(getList(wrapper)[0].data.id).toBe('ticket_id');
    });

    test('should display build pipeline event notification', () => {
        Store.store.state[Store.azureDevopsStoreName].ciBuilds = [{ id: 'build_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.CiBuild, id: 'build_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.CiBuild);
        expect(getList(wrapper)[0].data.id).toBe('build_id');
    });

    test('should display release pipeline event notification', () => {
        Store.store.state[Store.azureDevopsStoreName].cdReleases = [{ id: 'release_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.CdRelease, id: 'release_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.CdRelease);
        expect(getList(wrapper)[0].data.id).toBe('release_id');
    });

    test('should display commit event notification', () => {
        Store.store.state[Store.githubStoreName].commits = [{ id: 'commit_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.Commit, id: 'commit_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.Commit);
        expect(getList(wrapper)[0].data.id).toBe('commit_id');
    });

    test('should display pull request event notification', () => {
        Store.store.state[Store.githubStoreName].pullRequests = [{ id: 'pull_request_id' }];

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        sinonExpect.calledOnce(moveTopStub);
        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.PullRequest);
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
            data: { type: NotificationType.PullRequest, id: 'pull_request_id_1' }
        });

        const notificationId = getList(wrapper)[0].id;

        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id_2' }
        });

        expect(getList(wrapper).length).toBe(2);
        expect(getList(wrapper)[0].id).toBeGreaterThan(notificationId);
        expect(getList(wrapper)[0].data.type).toBe(NotificationType.PullRequest);
        expect(getList(wrapper)[0].data.id).toBe('pull_request_id_2');
        expect(getList(wrapper)[1].id).toBe(notificationId);
        expect(getList(wrapper)[1].data.type).toBe(NotificationType.PullRequest);
        expect(getList(wrapper)[1].data.id).toBe('pull_request_id_1');
    });

    test('should stop timer on mouse enter', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        expect(getList(wrapper).length).toBe(1);
        expect(isNaN(getList(wrapper)[0].timer)).toBeFalsy();

        wrapper.find('.notification-wrapper').trigger('mouseenter');

        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].timer).toBeNull();
    });

    test('should not stop timer on mouse enter when no card found', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        expect(getList(wrapper).length).toBe(1);
        expect(isNaN(getList(wrapper)[0].timer)).toBeFalsy();

        wrapper.vm['stopTimer']('another_pull_request_id');

        expect(getList(wrapper).length).toBe(1);
        expect(isNaN(getList(wrapper)[0].timer)).toBeFalsy();
    });

    test('should not stop timer on mouse enter when timer is not set', () => {
        vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        getList(wrapper)[0].timer = undefined;
        wrapper.find('.notification-wrapper').trigger('mouseenter');

        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].timer).toBeUndefined();
    });

    test('should not stop timer on mouse enter when timer is already cleared', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        getList(wrapper)[0].timer = null;
        wrapper.find('.notification-wrapper').trigger('mouseenter');

        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].timer).toBeNull();
    });

    test('should restore timer on mouse leave when timer is already cleared', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        getList(wrapper)[0].timer = null;
        wrapper.find('.notification-wrapper').trigger('mouseleave');

        expect(getList(wrapper).length).toBe(1);
        expect(isNaN(getList(wrapper)[0].timer)).toBeFalsy();
    });

    test('should not restore timer on mouse leave when timer is not cleared', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        const timer = getList(wrapper)[0].timer;
        wrapper.find('.notification-wrapper').trigger('mouseleave');

        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].timer).toBe(timer);
        expect(isNaN(getList(wrapper)[0].timer)).toBeFalsy();
    });

    test('should not restore timer on mouse leave when no card found', () => {
        vue.notify({
            group: 'notification',
            duration: 1000,
            data: { type: NotificationType.PullRequest, id: 'pull_request_id' }
        });

        const timer = getList(wrapper)[0].timer;
        wrapper.vm['restoreTimer']('another_pull_request_id');

        expect(getList(wrapper).length).toBe(1);
        expect(getList(wrapper)[0].timer).toBe(timer);
    });
});

function getList(wrapper: Wrapper<App>): any[] {
    return wrapper.vm['_cards'].$data.list;
}
