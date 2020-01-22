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
        expect(wrapper.vm.$props.size).toBe(50);
        expect(wrapper.vm.$props.isCircle).toBeFalsy();
        expect(wrapper.vm.$props.popoverPosition).toBe('bottom-start');
        expect(wrapper.vm.$props.popoverWidth).toBe(150);
        expect(wrapper.vm.$props.showPopover).toBeTruthy();
    });

    test('should change avatar shape', () => {
        wrapper.setProps({ isCircle: true });

        expect(wrapper.vm['shape']).toBe('circle');

        wrapper.setProps({ isCircle: false });

        expect(wrapper.vm['shape']).toBe('square');
    });
});