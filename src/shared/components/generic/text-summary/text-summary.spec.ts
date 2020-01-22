import { shallowMount, Wrapper } from '@vue/test-utils';

import TextSummary from './text-summary';

describe('text summary component unit test', () => {
    let wrapper: Wrapper<TextSummary>;

    beforeEach(() => {
        const propsData = { summary: 'summary_text', detail: 'detail_text' };
        wrapper = shallowMount(TextSummary, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.summary).toBe('summary_text');
        expect(wrapper.vm.$props.detail).toBe('detail_text');
    });
});
