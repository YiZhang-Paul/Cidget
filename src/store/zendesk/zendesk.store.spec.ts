import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import VueNotification from 'vue-notification';
import { assert as sinonExpect, stub, spy } from 'sinon';

import { createStore } from './zendesk.store';

Vue.use(Vuex);
Vue.use(VueNotification);

describe('zendesk store unit test', () => {
    let store: Store<any>;
    let notifySpy: any;

    beforeEach(() => {
        notifySpy = spy(Vue, 'notify');
        store = new Store(createStore());
    });

    afterEach(() => {
        notifySpy.restore();
    });

    describe('addTicketFromMail', () => {
        let ticket: any;

        beforeEach(() => {
            ticket = {
                id: '147',
                assignedToUser: false,
                content: 'ticket_content',
                htmlContent: 'ticket_html_content',
                group: 'group_name',
                status: 'opened',
                title: 'ticket_title'
            };
        });

        test('should add support ticket', async () => {
            store.state.tickets = [];

            await store.dispatch('addTicketFromMail', ticket);

            sinonExpect.calledOnce(notifySpy);
            expect(notifySpy.args[0][0].group).toBe('notification');
            expect(notifySpy.args[0][0].duration).toBe(-1);
            expect(notifySpy.args[0][0].data.type).toBe('support-ticket');
            expect(notifySpy.args[0][0].data.id).toBe('147');
            expect(notifySpy.args[0][0].data.model).toStrictEqual(ticket);
            expect(store.getters.getTickets.length).toBe(1);
        });

        test('should not add support ticket when same ticket already exists', async () => {
            store.state.tickets = [ticket];

            await store.dispatch('addTicketFromMail', ticket);

            sinonExpect.notCalled(notifySpy);
        });

        test('should update support ticket when ticket has changes', async () => {
            store.state.tickets = [Object.assign({}, ticket, { status: 'reopened' })];

            await store.dispatch('addTicketFromMail', ticket);

            sinonExpect.calledOnce(notifySpy);
            expect(store.getters.getTickets.length).toBe(1);
        });
    });
});
