import ISupportTicket from './support-ticket.interface';

export default interface ISupportTicketProvider<T = any> {
    toTicket(data: T): ISupportTicket;
}
