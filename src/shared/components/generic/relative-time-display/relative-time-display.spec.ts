import { shallowMount, Wrapper } from '@vue/test-utils';

import RelativeTimeDisplay from './relative-time-display';

describe('relative time display component unit test', () => {
    let wrapper: Wrapper<RelativeTimeDisplay>;

    beforeEach(() => {
        wrapper = shallowMount(RelativeTimeDisplay);
    });

    afterEach(() => {
        wrapper.destroy();
        jest.useRealTimers();
    });

    test('should create component instance', () => {
        const propsData = { time: new Date('2020-01-03T06:45:41.370Z') };
        wrapper = shallowMount(RelativeTimeDisplay, { propsData });

        expect(wrapper.vm.$props.time.toISOString()).toBe('2020-01-03T06:45:41.370Z');
    });

    test('should run timer every second for the first minute', () => {
        jest.useFakeTimers();
        wrapper = shallowMount(RelativeTimeDisplay, { propsData: { time: new Date() } });
        jest.advanceTimersByTime(60000);

        expect(wrapper.vm.$data.timerCounter).toBe(61);
    });

    test('should run timer every minute after the first minute', () => {
        jest.useFakeTimers();
        wrapper = shallowMount(RelativeTimeDisplay, { propsData: { time: new Date() } });
        jest.advanceTimersByTime(120000);

        expect(wrapper.vm.$data.timerCounter).toBe(62);
    });

    test('should stop timer when component is destroyed', () => {
        jest.useFakeTimers();
        wrapper.destroy();
        jest.advanceTimersByTime(120000);

        expect(wrapper.vm.$data.timerActive).toBeFalsy();
        expect(wrapper.vm.$data.timerCounter).toBe(1);
    });

    describe('relativeTime', () => {
        test('should return proper relative time in seconds', () => {
            wrapper.setProps({ time: new Date(Date.now() - 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 second');

            wrapper.setProps({ time: new Date(Date.now() - 15 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 seconds');
        });

        test('should return proper relative time in minutes', () => {
            wrapper.setProps({ time: new Date(Date.now() - 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 minute');

            wrapper.setProps({ time: new Date(Date.now() - 15 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 minutes');
        });

        test('should return proper relative time in hours', () => {
            wrapper.setProps({ time: new Date(Date.now() - 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 hour');

            wrapper.setProps({ time: new Date(Date.now() - 15 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 hours');
        });

        test('should return proper relative time in days', () => {
            wrapper.setProps({ time: new Date(Date.now() - 23.5 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 day');

            wrapper.setProps({ time: new Date(Date.now() - 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 day');

            wrapper.setProps({ time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 days');
        });

        test('should return proper relative time in months', () => {
            wrapper.setProps({ time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 month');

            wrapper.setProps({ time: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('5 months');
        });

        test('should return proper relative time in years', () => {
            wrapper.setProps({ time: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 year');

            wrapper.setProps({ time: new Date(Date.now() - 2.5 * 365 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('3 years');
        });
    });

    describe('absoluteTime', () => {
        test('should return proper absolute time for today', () => {
            const time = new Date(Date.now() - 30 * 1000);
            wrapper.setProps({ time });

            expect(wrapper.vm['absoluteTime']).toBe(`today ${time.toLocaleTimeString()}`);
        });

        test('should return proper absolute time for today', () => {
            const time = new Date(Date.now() - 2 * 60 * 60 * 1000);
            wrapper.setProps({ time });

            expect(wrapper.vm['absoluteTime']).toBe(`today ${time.toLocaleTimeString()}`);
        });

        test('should return proper absolute time for yesterday', () => {
            const time = new Date(Date.now() - 24 * 60 * 60 * 1000);
            wrapper.setProps({ time });

            expect(wrapper.vm['absoluteTime']).toBe(`yesterday ${time.toLocaleTimeString()}`);
        });

        test('should return proper absolute time for specific date', () => {
            const time = new Date(2020, 1, 2);
            wrapper.setProps({ time });

            expect(wrapper.vm['absoluteTime']).toBe(`Feb 2 ${time.toLocaleTimeString()}`);
        });
    });
});
