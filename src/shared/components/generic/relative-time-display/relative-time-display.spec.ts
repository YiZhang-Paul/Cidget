import { shallowMount, Wrapper } from '@vue/test-utils';

import RelativeTimeDisplay from './relative-time-display';

describe('relative time display component unit test', () => {
    let wrapper: Wrapper<RelativeTimeDisplay>;

    beforeEach(() => {
        const propsData = { time: new Date('2020-01-03T06:45:41.370Z') };
        wrapper = shallowMount(RelativeTimeDisplay, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.time.toISOString()).toBe('2020-01-03T06:45:41.370Z');
    });

    describe('relativeTime', () => {
        test('should return proper relative time in seconds', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 second ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 15 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 seconds ago');
        });

        test('should return proper relative time in minutes', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 minute ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 15 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 minutes ago');
        });

        test('should return proper relative time in hours', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 hour ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 15 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 hours ago');
        });

        test('should return proper relative time in days', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 day ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('15 days ago');
        });

        test('should return proper relative time in months', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 month ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 5 * 30 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('5 months ago');
        });

        test('should return proper relative time in years', () => {
            wrapper.setProps({ time: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('1 year ago');

            wrapper.setProps({ time: new Date(new Date().getTime() - 2.5 * 365 * 24 * 60 * 60 * 1000) });

            expect(wrapper.vm['relativeTime']).toBe('3 years ago');
        });
    });
});
