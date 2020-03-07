jest.mock('electron', () => ({
    shell: { async openExternal(_: string): Promise<void> { } }
}));

import { shallowMount, Wrapper } from '@vue/test-utils';
import { assert as sinonExpect, spy } from 'sinon';
import { shell } from 'electron';

import '../../../../startups/element-ui-test.js';

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

    test('should properly display tooltip', () => {
        wrapper.setProps({ tooltip: 'some plain text', useHtmlTooltip: false });

        expect(wrapper.find('.tooltip-content').contains('h2')).toBeFalsy();

        wrapper.setProps({ tooltip: '<h2>some plain text</h2>', useHtmlTooltip: true });

        expect(wrapper.find('.tooltip-content').contains('h2')).toBeTruthy();
    });
});
