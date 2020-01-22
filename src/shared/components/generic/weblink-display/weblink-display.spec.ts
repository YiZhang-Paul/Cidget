import { shallowMount, Wrapper } from '@vue/test-utils';

import WeblinkDisplay from './weblink-display';

describe('weblink display component unit test', () => {
    let wrapper: Wrapper<WeblinkDisplay>;

    beforeEach(() => {
        const propsData = { text: 'link_text', url: 'link_url' };
        const stubs = { ElTooltip: '<div></div>' };
        wrapper = shallowMount(WeblinkDisplay, { propsData, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
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
});
