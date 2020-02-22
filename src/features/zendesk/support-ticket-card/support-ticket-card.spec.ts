import { shallowMount, Wrapper } from '@vue/test-utils';

import SupportTicketCard from './support-ticket-card';

describe('support ticket card component unit test', () => {
    let wrapper: Wrapper<SupportTicketCard>;
    let ticket: any;

    beforeEach(() => {
        ticket = {
            status: 'opened',
            assignee: [{}],
            requester: {}
        };

        const stubs = {
            WeblinkDisplay: '<div></div>',
            ConversationPreviewBadge: '<div></div>'
        };

        wrapper = shallowMount(SupportTicketCard, { propsData: { ticket }, stubs });
    });

    afterEach(() => {
        wrapper.destroy();
    });

    test('should create component instance', () => {
        expect(wrapper.vm.$props.ticket.status).toBe('opened');
        expect(wrapper.vm.$props.ticket.assignee.length).toBe(1);
    });

    test('should properly display status', () => {
        wrapper.setProps({ ticket: Object.assign({}, ticket, { status: 'reopened' }) });

        expect(wrapper.vm['statusText']).toBe('Reopened');

        wrapper.setProps({ ticket: Object.assign({}, ticket, { status: 'opened', assignedToUser: true }) });

        expect(wrapper.vm['statusText']).toBe('YOU');

        wrapper.setProps({ ticket: Object.assign({}, ticket, { status: 'opened', group: 'assigned_group' }) });

        expect(wrapper.vm['statusText']).toBe('assigned_group');

        wrapper.setProps({ ticket: Object.assign({}, ticket, { status: 'opened' }) });

        expect(wrapper.vm['statusText']).toBe('1 assignee');

        wrapper.setProps({ ticket: Object.assign({}, ticket, { status: 'opened', assignee: [{}, {}] }) });

        expect(wrapper.vm['statusText']).toBe('2 assignees');
    });
});
