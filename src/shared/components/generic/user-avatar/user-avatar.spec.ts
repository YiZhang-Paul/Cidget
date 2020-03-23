import { shallowMount, Wrapper } from '@vue/test-utils';

import UserAvatar from './user-avatar';

describe('user avatar component unit test', () => {
    let wrapper: Wrapper<UserAvatar>;

    beforeEach(() => {
        wrapper = shallowMount(UserAvatar, { propsData: { url: 'avatar_url' } });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.url).toBe('avatar_url');
        expect(wrapper.vm.$props.size).toBe(80);
    });
});
