import { shallowMount, Wrapper } from '@vue/test-utils';

import UserAvatar from './user-avatar';

describe('user avatar component unit test', () => {
    let wrapper: Wrapper<UserAvatar>;

    beforeEach(() => {
        const propsData = { url: 'avatar_url' };
        const stubs = { ElAvatar: '<div></div>', ElPopover: '<div></div>' };
        wrapper = shallowMount(UserAvatar, { propsData, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.url).toBe('avatar_url');
        expect(wrapper.vm.$props.size).toBe(70);
        expect(wrapper.vm.$props.popoverPosition).toBe('bottom-start');
        expect(wrapper.vm.$props.popoverWidth).toBe(150);
        expect(wrapper.vm.$props.showPopover).toBeTruthy();
    });
});
