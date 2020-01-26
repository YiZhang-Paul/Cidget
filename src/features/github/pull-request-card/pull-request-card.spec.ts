import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../mocks/electron';

import PullRequestCard from './pull-request-card';

describe('pull request card component unit test', () => {
    let wrapper: Wrapper<PullRequestCard>;
    let shellSpy: any;
    let pullRequest: any;

    beforeEach(() => {
        pullRequest = {
            branch: { source: 'yizhang', base: 'development' },
            initiator: { profileUrl: 'profile_url' },
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
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.pullRequest.branch.source).toBe('yizhang');
        expect(wrapper.vm.$props.pullRequest.branch.base).toBe('development');
    });

    test('should open external link', () => {
        wrapper.find('.name').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'profile_url');
    });

    test('should apply correct class to indicate if pull request is mergeable', () => {
        pullRequest.mergeable = null;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message').contains('.mergeable')).toBeFalsy();
        expect(wrapper.find('.pull-request-message').contains('.not-mergeable')).toBeFalsy();

        pullRequest.mergeable = true;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message').contains('.mergeable')).toBeTruthy();
        expect(wrapper.find('.pull-request-message').contains('.not-mergeable')).toBeFalsy();

        pullRequest.mergeable = false;
        wrapper.setProps({ pullRequest: Object.assign({}, pullRequest) });

        expect(wrapper.find('.pull-request-message').contains('.mergeable')).toBeFalsy();
        expect(wrapper.find('.pull-request-message').contains('.not-mergeable')).toBeTruthy();
    });
});
