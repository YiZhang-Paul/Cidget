import { shallowMount, Wrapper } from '@vue/test-utils';

import UserInfoCard from './user-info-card';

describe('user info card component unit test', () => {
    let wrapper: Wrapper<UserInfoCard>;

    beforeEach(() => {
        const propsData = { initiator: { name: 'initiator_name' } };
        wrapper = shallowMount(UserInfoCard, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.initiator.name).toBe('initiator_name');
    });
});
