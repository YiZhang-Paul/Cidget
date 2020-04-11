import { ActionContext, StoreOptions } from 'vuex';

import Types from '../../core/ioc/types';
import Container from '../../core/ioc/container';
import NotificationType from '../../core/enum/notification-type.enum';
import ISupportTicket from '../../core/interface/customer-support/support-ticket.interface';
import NotificationHandler from '../../core/service/io/notification-handler/notification-handler';

type State = {
    tickets: ISupportTicket[];
};

let notificationHandler: NotificationHandler;

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

        if (getters.hasSameTicket(ticket)) {
            return;
        }
        commit(getters.hasTicket(ticket) ? 'updateTicket' : 'addTicket', ticket);

        notificationHandler.push(NotificationType.SupportTicket, {
            group: 'notification',
            duration: -1,
            data: {
                type: NotificationType.SupportTicket,
                id: ticket.id,
                logoUrl: require('../../../public/images/zendesk-logo.png'),
                model: ticket
            }
        });
    }
};

const getters = {
    getTickets(state: State): ISupportTicket[] {
        return state.tickets;
    },
    hasSameTicket(state: State): Function {
        return (ticket: ISupportTicket): boolean => {
            const existing = state.tickets.find(_ => _.id === ticket.id);

            return existing ? existing.createdOn.getTime() === ticket.createdOn.getTime() : false;
        };
    },
    hasTicket(state: State): Function {
        return (ticket: ISupportTicket): boolean => {
            return state.tickets.some(_ => _.id === ticket.id);
        };
    }
};

export const createStore = () => {
    const state: State = { tickets: [] };
    notificationHandler = Container.get<NotificationHandler>(Types.NotificationHandler);

    return ({
        namespaced: true,
        state,
        mutations,
        actions,
        getters
    }) as StoreOptions<State>;
};

export default createStore();
