import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';

import { shell } from '../../../../mocks/electron';

import BranchBadge from './branch-badge';

describe('branch badge component unit test', () => {
    let wrapper: Wrapper<BranchBadge>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = { name: 'development', url: 'branch_url' };
        wrapper = shallowMount(BranchBadge, { propsData });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.name).toBe('development');
        expect(wrapper.vm.$props.url).toBe('branch_url');
    });

    test('should open external link when enabled', () => {
        wrapper.find('.url').element.click();

        expect(wrapper.vm.$props.disabled).toBeFalsy();
        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'branch_url');
    });

    test('should not open external link when disabled', () => {
        wrapper.setProps({ disabled: true });

        wrapper.find('.url').element.click();

        expect(wrapper.vm.$props.disabled).toBeTruthy();
        sinonExpect.notCalled(shellSpy);
    });
});
