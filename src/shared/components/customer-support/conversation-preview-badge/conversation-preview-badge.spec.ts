import { shallowMount, Wrapper } from '@vue/test-utils';

import ConversationPreviewBadge from './conversation-preview-badge';

describe('conversation preview badge component unit test', () => {
    let wrapper: Wrapper<ConversationPreviewBadge>;

    beforeEach(() => {
        const propsData = {
            username: 'user_name',
            conversation: 'conversation_text',
            tooltip: 'tooltip_text'
        };

        wrapper = shallowMount(ConversationPreviewBadge, { propsData });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.username).toBe('user_name');
        expect(wrapper.vm.$props.conversation).toBe('conversation_text');
        expect(wrapper.vm.$props.tooltip).toBe('tooltip_text');
    });
});
