import { injectable } from 'inversify';

import IEmail from '../../../interface/general/email.interface';
import ISupportTicket from '../../../interface/customer-support/support-ticket.interface';
import ISupportTicketProvider from '../../../interface/customer-support/support-ticket-provider.interface';

@injectable()
export default class ZendeskTicketByMailProvider implements ISupportTicketProvider<IEmail> {

    public isZendeskEmail(data: IEmail): boolean {
        return /zendesk\.com\/agent\/tickets\/\d+/i.test(data.body);
    }

    public toTicket(data: IEmail): ISupportTicket {
        const url = (data.body.match(/zendesk.com\/agent\/tickets\/\d+/i) || [''])[0];

        return ({
            id: url.split('/').slice(-1)[0],
            title: data.subject,
            content: '',
            url,
            status: '',
            requester: data.from,
            assignee: data.to,
            assignedToUser: /you have been assigned to/i.test(data.body)
        }) as ISupportTicket;
    }
}
