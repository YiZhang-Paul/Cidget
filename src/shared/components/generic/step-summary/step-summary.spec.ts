import { shallowMount, Wrapper } from '@vue/test-utils';

import '../../../../element-ui-test.js';

import StepSummary from './step-summary';

describe('step summary component unit test', () => {
    let wrapper: Wrapper<StepSummary>;
    let steps: any[];

    beforeEach(() => {
        steps = [
            { name: 'stage-1', scale: -1, isActive: false },
            { name: 'stage-2', scale: 4, isActive: true },
            { name: 'stage-3', scale: 20, isActive: false }
        ];

        wrapper = shallowMount(StepSummary, { propsData: { steps } });
    });

    afterEach(() => {
        wrapper.destroy();
        jest.useRealTimers();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.steps.length).toBe(steps.length);
    });

    test('should display stage colors according to scale', () => {
        jest.useFakeTimers();
        wrapper = shallowMount(StepSummary, { propsData: { steps } });
        wrapper.vm.$data.colorOn = true;

        const grids = wrapper.findAll('.grid');

        expect(grids.wrappers.length).toBe(steps.length);
        expect(grids.wrappers[0].contains('.purple')).toBeTruthy();
        expect(grids.wrappers[1].contains('.green')).toBeTruthy();
        expect(grids.wrappers[2].contains('.red')).toBeTruthy();
    });

    test('should blink active step icon', () => {
        jest.useFakeTimers();
        wrapper = shallowMount(StepSummary, { propsData: { steps } });
        wrapper.vm.$data.colorOn = true;

        let grids = wrapper.findAll('.grid');

        expect(wrapper.vm.$data.colorOn).toBeTruthy();
        expect(grids.wrappers[0].contains('.no-color')).toBeFalsy();
        expect(grids.wrappers[1].contains('.no-color')).toBeFalsy();
        expect(grids.wrappers[2].contains('.no-color')).toBeFalsy();

        jest.advanceTimersByTime(400);
        grids = wrapper.findAll('.grid');

        expect(wrapper.vm.$data.colorOn).toBeFalsy();
        expect(grids.wrappers[0].contains('.no-color')).toBeFalsy();
        expect(grids.wrappers[1].contains('.no-color')).toBeTruthy();
        expect(grids.wrappers[2].contains('.no-color')).toBeFalsy();

        jest.advanceTimersByTime(400);
        grids = wrapper.findAll('.grid');

        expect(wrapper.vm.$data.colorOn).toBeTruthy();
        expect(grids.wrappers[0].contains('.no-color')).toBeFalsy();
        expect(grids.wrappers[1].contains('.no-color')).toBeFalsy();
        expect(grids.wrappers[2].contains('.no-color')).toBeFalsy();
    });

    test('should not blink active step icon when blink mode is off', () => {
        jest.useFakeTimers();
        wrapper = shallowMount(StepSummary, { propsData: { steps, blinkMode: false } });

        jest.advanceTimersByTime(400);

        expect(wrapper.vm.$data.colorOn).toBeTruthy();

        jest.advanceTimersByTime(400);

        expect(wrapper.vm.$data.colorOn).toBeTruthy();

        jest.advanceTimersByTime(400);

        expect(wrapper.vm.$data.colorOn).toBeTruthy();
    });
});
