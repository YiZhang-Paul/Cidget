import { mount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import '../../../element-ui-test.js';
import { shell } from '../../../mocks/third-party/electron';

import CommitCard from './commit-card';

describe('commit card card component unit test', () => {
    let wrapper: Wrapper<CommitCard>;
    let shellSpy: any;
    let commit: any;

    beforeEach(() => {
        commit = {
            branch: 'development',
            repository: {
                url: 'repository_url'
            },
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

        const closeHandler = () => undefined;
        wrapper = mount(CommitCard, { propsData: { commit, closeHandler }, stubs });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.commit.initiator.name).toBe('yizhang');
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

    test('should open pull request creation page', () => {
        wrapper.find('.open-pull-request-icon').element.click();

        sinonExpect.calledOnce(shellSpy);
        expect(shellSpy.args[0][0]).toBe('repository_url/compare/development');
    });
});
