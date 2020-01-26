import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../mocks/electron';

import CommitCard from './commit-card';

describe('commit card card component unit test', () => {
    let wrapper: Wrapper<CommitCard>;
    let shellSpy: any;

    beforeEach(() => {
        const commit = {
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
});
