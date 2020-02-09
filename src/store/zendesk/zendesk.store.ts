import Vue from 'vue';
import { ActionContext, StoreOptions } from 'vuex';

import ISupportTicket from '../../core/interface/customer-support/support-ticket.interface';

type State = {
    tickets: ISupportTicket[];
};

const mutations = {
    addTicket(state: State, ticket: ISupportTicket): void {
        state.tickets.unshift(ticket);
    },
    updateTicket(state: State, ticket: ISupportTicket): void {
        state.tickets = state.tickets.filter(_ => _.id !== ticket.id);
        state.tickets.unshift(ticket);
    }
};

const actions = {
    addTicketFromMail(context: ActionContext<State, any>, ticket: ISupportTicket): void {
        const { commit, getters } = context;
        commit(getters.hasTicket(ticket) ? 'updateTicket' : 'addTicket', ticket);

        Vue.notify({
            group: 'notification',
            duration: -1,
            data: { type: 'support-ticket', id: ticket.id, model: ticket }
        });
    }
};

const getters = {
    getTickets(state: State): ISupportTicket[] {
        return state.tickets;
    },
    hasTicket(state: State): Function {
        return (ticket: ISupportTicket): boolean => {
            return state.tickets.some(_ => _.id === ticket.id);
        };
    }
};

export const createStore = () => {
    const state: State = { tickets: [] };

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
