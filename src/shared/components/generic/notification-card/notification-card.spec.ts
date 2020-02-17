import { shallowMount, Wrapper } from '@vue/test-utils';

import NotificationCard from './notification-card';

describe('notification card component unit test', () => {
    let wrapper: Wrapper<NotificationCard>;

    beforeEach(() => {
        const propsData = { logoUrl: 'logo_url', closeHandler: () => undefined };
        const stubs = { UserAvatar: '<div></div>' };
        wrapper = shallowMount(NotificationCard, { propsData, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.logoUrl).toBe('logo_url');
        expect(wrapper.vm.$props.showLogoPopover).toBeFalsy();
    });
});
