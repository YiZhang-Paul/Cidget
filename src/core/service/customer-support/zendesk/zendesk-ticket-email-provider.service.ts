import { injectable } from 'inversify';

import IEmail from '../../../interface/generic/email.interface';
import ISupportTicket from '../../../interface/customer-support/support-ticket.interface';
import ISupportTicketProvider from '../../../interface/customer-support/support-ticket-provider.interface';

@injectable()
export default class ZendeskTicketEmailProvider implements ISupportTicketProvider<IEmail> {

    public isZendeskEmail(email: IEmail): boolean {
        return /zendesk\.com\/agent\/tickets\/\d+/i.test(email.body);
    }

    public toTicket(email: IEmail): ISupportTicket {
        const { body, subject, from, to } = email;
        const url = this.getUrl(body);
        from.name = from.name.replace(/\s?\(.*$/i, '');

        return ({
            id: url.split('/').slice(-1)[0],
            title: subject.replace(/^.*assignment:?\s?/i, ''),
            htmlContent: body,
            createdOn: email.created,
            url,
            status: /has been reopened/i.test(body) ? 'reopened' : 'opened',
            requester: from,
            group: this.getGroup(body),
            assignee: to,
            assignedToUser: /you have been assigned to/i.test(body)
        }) as ISupportTicket;
    }

    private getUrl(data: string): string {
        const match = data.match(/https:\/\/[^(https)]*zendesk.com\/agent\/tickets\/\d+/i);

        return (match || [''])[0];
    }

    private getGroup(data: string): string {
        const match = data.match(/(?<=assigned to group ['"]).*(?=['"], of)/i);

        return (match || [''])[0];
    }
}
