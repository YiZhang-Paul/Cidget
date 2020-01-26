import Vue from 'vue';
import ElementUI from 'element-ui';
import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../../mocks/third-party/electron';

import RepositoryBadge from './repository-badge';

Vue.use(ElementUI);

describe('repository badge component unit test', () => {
    let wrapper: Wrapper<RepositoryBadge>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = { repository: { id: 'repository_id', url: 'repository_url' } };
        const stubs = { RepositoryInfoCard: '<div></div>' };
        wrapper = shallowMount(RepositoryBadge, { propsData, stubs });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.repository.id).toBe('repository_id');
        expect(wrapper.vm.$props.showPopover).toBeTruthy();
        expect(wrapper.vm.$props.popoverWidth).toBe(100);
        expect(wrapper.vm.$props.popoverPosition).toBe('bottom');
    });

    test('should open external links', () => {
        wrapper.find('.repository-name').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'repository_url');
    });
});
