jest.mock('electron', () => ({
    shell: { async openExternal(_: string): Promise<void> { } }
}));

import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';
import { shell } from 'electron';

import '../../../../element-ui-test.js';

import WeblinkDisplay from './weblink-display';

describe('weblink display component unit test', () => {
    let wrapper: Wrapper<WeblinkDisplay>;
    let shellSpy: any;

    beforeEach(() => {
        const propsData = { text: 'link_text', url: 'link_url' };
        wrapper = shallowMount(WeblinkDisplay, { propsData });
        shellSpy = spy(shell, 'openExternal');
    });

    afterEach(() => {
        wrapper.destroy();
        shellSpy.restore();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.text).toBe('link_text');
        expect(wrapper.vm.$props.url).toBe('link_url');
        expect(wrapper.vm.$props.tooltipPosition).toBe('top-start');
        expect(wrapper.vm.$props.isDarkMode).toBeFalsy();
    });

    test('should change color mode', () => {
        wrapper.setProps({ isDarkMode: true });

        expect(wrapper.vm['colorMode']).toBe('dark');

        wrapper.setProps({ isDarkMode: false });

        expect(wrapper.vm['colorMode']).toBe('light');
    });

    test('should open external link when url is specified', () => {
        wrapper.find('.url').element.click();

        expect(wrapper.vm.$props.url).toBeTruthy();
        sinonExpect.calledOnce(shellSpy);
        sinonExpect.calledWith(shellSpy, 'link_url');
    });

    test('should not open external link when url is not specified', () => {
        wrapper.setProps({ url: '' });

        wrapper.find('.url').element.click();

        expect(wrapper.vm.$props.url).toBeFalsy();
        sinonExpect.notCalled(shellSpy);
    });
});
