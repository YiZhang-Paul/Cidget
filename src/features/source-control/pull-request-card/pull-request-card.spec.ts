import { shallowMount, Wrapper } from '@vue/test-utils';

import PullRequestCard from './pull-request-card';

describe('pull request card component unit test', () => {
    let wrapper: Wrapper<PullRequestCard>;
    let pullRequest: any;

    beforeEach(() => {
        pullRequest = {
            action: 'opened',
            branch: { source: 'yizhang', base: 'development' },
            initiator: { profileUrl: 'profile_url' },
            repository: {},
            reviewers: {
                requested: [],
                approved: []
            }
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

    test('should apply correct class to indicate if pull request is mergeable', () => {
        pullRequest.mergeable = null;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message-container').contains('.mergeable')).toBeFalsy();
        expect(wrapper.find('.pull-request-message-container').contains('.not-mergeable')).toBeFalsy();

        pullRequest.mergeable = true;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message-container').contains('.mergeable')).toBeTruthy();
        expect(wrapper.find('.pull-request-message-container').contains('.not-mergeable')).toBeFalsy();

        pullRequest.mergeable = false;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message-container').contains('.mergeable')).toBeFalsy();
        expect(wrapper.find('.pull-request-message-container').contains('.not-mergeable')).toBeTruthy();
    });
});
