import { shallowMount, Wrapper } from '@vue/test-utils';

import BranchBadge from './branch-badge';

describe('branch badge component unit test', () => {
    let wrapper: Wrapper<BranchBadge>;

    beforeEach(() => {
        const propsData = { name: 'development', url: 'branch_url' };
        wrapper = shallowMount(BranchBadge, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.name).toBe('development');
        expect(wrapper.vm.$props.url).toBe('branch_url');
    });
});
