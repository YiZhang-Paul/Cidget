import { shallowMount, Wrapper } from '@vue/test-utils';

import App from './app';

describe('app component unit test', () => {
    let wrapper: Wrapper<App>;

    beforeEach(() => {
        const stubs = {
            notifications: '<div></div>'
        };

        wrapper = shallowMount(App, { stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm).toBeTruthy();
    });
});
