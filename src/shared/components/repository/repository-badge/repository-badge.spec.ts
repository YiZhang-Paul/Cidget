jest.mock('electron', () => ({
    shell: { async openExternal(_: string): Promise<void> { } }
}));

import { mount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';
import { shell } from 'electron';

import '../../../../startups/element-ui-test.js';

import RepositoryBadge from './repository-badge';

describe('repository badge component unit test', () => {
    let wrapper: Wrapper<RepositoryBadge>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = { repository: { id: 'repository_id', url: 'repository_url' } };
        wrapper = mount(RepositoryBadge, { propsData });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.repository.id).toBe('repository_id');
    });

    test('should open external links', () => {
        wrapper.find('.url').element.click();

        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'repository_url');
    });
});
