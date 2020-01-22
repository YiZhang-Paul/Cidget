import { shallowMount, Wrapper } from '@vue/test-utils';

import RepositoryBadge from './repository-badge';

describe('repository badge component unit test', () => {
    let wrapper: Wrapper<RepositoryBadge>;

    beforeEach(() => {
        const propsData = { repository: { id: 'repository_id' } };
        const stubs = { ElPopover: '<div></div>', RepositoryInfoCard: '<div></div>' };
        wrapper = shallowMount(RepositoryBadge, { propsData, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.repository.id).toBe('repository_id');
        expect(wrapper.vm.$props.showPopover).toBeTruthy();
        expect(wrapper.vm.$props.popoverWidth).toBe(100);
        expect(wrapper.vm.$props.popoverPosition).toBe('bottom');
    });
});
