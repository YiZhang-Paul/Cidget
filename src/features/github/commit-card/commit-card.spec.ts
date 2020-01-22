import { shallowMount, Wrapper } from '@vue/test-utils';

import CommitCard from './commit-card';

describe('commit card card component unit test', () => {
    let wrapper: Wrapper<CommitCard>;

    beforeEach(() => {
        const commit = {
            repository: {},
            initiator: { name: 'yizhang' }
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
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.commit.initiator.name).toBe('yizhang');
    });
});
