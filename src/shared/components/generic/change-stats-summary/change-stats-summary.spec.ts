import { shallowMount, Wrapper } from '@vue/test-utils';

import ChangeStatsSummary from './change-stats-summary';

describe('change stats summary component unit test', () => {
    let wrapper: Wrapper<ChangeStatsSummary>;

    beforeEach(() => {
        const propsData = { added: 2, removed: 1, modified: 3 };
        wrapper = shallowMount(ChangeStatsSummary, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.added).toBe(2);
        expect(wrapper.vm.$props.removed).toBe(1);
        expect(wrapper.vm.$props.modified).toBe(3);
    });
});
