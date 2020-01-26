import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../mocks/electron';

import UserInfoCard from './user-info-card';

describe('user info card component unit test', () => {
    let wrapper: Wrapper<UserInfoCard>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = {
            initiator: {
                name: 'initiator_name',
                profileUrl: 'profile_url',
                gistUrl: 'gist_url'
            }
        };

        wrapper = shallowMount(UserInfoCard, { propsData });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.initiator.name).toBe('initiator_name');
    });

    test('should open external link', () => {
        const links = wrapper.findAll('a');
        links.wrappers.forEach(_ => _.element.click());

        expect(links.wrappers.length).toBe(4);
        sinonExpect.callCount(shellSpy, 4);
        expect(shellSpy.getCall(0).calledWith('profile_url'));
        expect(shellSpy.getCall(1).calledWith('profile_url?tab=repositories'));
        expect(shellSpy.getCall(2).calledWith('gist_url'));
        expect(shellSpy.getCall(3).calledWith('profile_url?tab=followers'));
    });
});
