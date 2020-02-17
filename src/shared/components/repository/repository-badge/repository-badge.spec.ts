jest.mock('electron', () => ({
    shell: { async openExternal(_: string): Promise<void> { } }
}));

import { mount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';
import { shell } from 'electron';

import '../../../../element-ui-test.js';

import RepositoryBadge from './repository-badge';

describe('repository badge component unit test', () => {
    let wrapper: Wrapper<RepositoryBadge>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = { repository: { id: 'repository_id', url: 'repository_url' } };
        const stubs = { RepositoryInfoCard: '<div></div>' };
        wrapper = mount(RepositoryBadge, { propsData, stubs });
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
        wrapper.find('.url').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'repository_url');
    });
});
