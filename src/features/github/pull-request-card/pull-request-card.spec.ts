import { shallowMount, Wrapper } from '@vue/test-utils';

import PullRequestCard from './pull-request-card';

describe('pull request card component unit test', () => {
    let wrapper: Wrapper<PullRequestCard>;

    beforeEach(() => {
        const pullRequest = {
            branch: { source: 'yizhang', base: 'development' },
            initiator: {},
            repository: {}
        };

        const stubs = {
            UserAvatar: '<div></div>',
            WeblinkDisplay: '<div></div>',
            ChangeStatsSummary: '<div></div>',
            BranchBadge: '<div></div>',
            RepositoryBadge: '<div></div>',
            RelativeTimeDisplay: '<div></div>'
        };

        wrapper = shallowMount(PullRequestCard, { propsData: { pullRequest }, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.pullRequest.branch.source).toBe('yizhang');
        expect(wrapper.vm.$props.pullRequest.branch.base).toBe('development');
    });
});
