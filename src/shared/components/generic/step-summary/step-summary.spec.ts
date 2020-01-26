import Vue from 'vue';
import ElementUI from 'element-ui';
import { shallowMount, Wrapper } from '@vue/test-utils';

import StepSummary from './step-summary';

Vue.use(ElementUI);

describe('step summary component unit test', () => {
    let wrapper: Wrapper<StepSummary>;

    beforeEach(() => {
        const steps = [
            { name: 'stage-1', scale: -1 },
            { name: 'stage-2', scale: 4 },
            { name: 'stage-3', scale: 20 }
        ];

        wrapper = shallowMount(StepSummary, { propsData: { steps } });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.steps.length).toBe(3);
    });

    test('should display stage colors according to scale', () => {
        const grids = wrapper.findAll('.grid');

        expect(grids.wrappers.length).toBe(3);
        expect(grids.wrappers[0].contains('.purple'));
        expect(grids.wrappers[1].contains('.green'));
        expect(grids.wrappers[2].contains('.red'));
    });
});
