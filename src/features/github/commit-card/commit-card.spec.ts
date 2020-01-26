import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../mocks/third-party/electron';

import CommitCard from './commit-card';

describe('commit card card component unit test', () => {
    let wrapper: Wrapper<CommitCard>;
    let shellSpy: any;
    let commit: any;

    beforeEach(() => {
        commit = {
            repository: {},
            initiator: {
                name: 'yizhang',
                profileUrl: 'profile_url'
            }
        };

        const stubs = {
            UserAvatar: '<div></div>',
            UserInfoCard: '<div></div>',
            WeblinkDisplay: '<div></div>',
            ChangeStatsSummary: '<div></div>',
            BranchBadge: '<div></div>',
            RepositoryBadge: '<div></div>',
            RelativeTimeDisplay: '<div></div>'
        };

        wrapper = shallowMount(CommitCard, { propsData: { commit }, stubs });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.commit.initiator.name).toBe('yizhang');
    });

    test('should open external link', () => {
        wrapper.find('.name').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'profile_url');
    });

    test('should show correct file changes', () => {
        commit.added = null;
        commit.removed = null;
        commit.modified = null;
        wrapper.setProps({ commit: Object.assign({}, commit) });

        expect(wrapper.vm['added']).toBe(0);
        expect(wrapper.vm['removed']).toBe(0);
        expect(wrapper.vm['modified']).toBe(0);

        commit.added = [{}];
        commit.removed = [{}, {}, {}];
        commit.modified = [{}, {}];
        wrapper.setProps({ commit: Object.assign({}, commit) });

        expect(wrapper.vm['added']).toBe(1);
        expect(wrapper.vm['removed']).toBe(3);
        expect(wrapper.vm['modified']).toBe(2);
    });
});
