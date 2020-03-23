import Types from '../../../ioc/types';
import Container from '../../../ioc/container';
import IUser from '../../../interface/generic/user.interface';
import IEmail from '../../../interface/generic/email.interface';

import ZendeskTicketEmailProvider from './zendesk-ticket-email-provider.service';

describe('zendesk ticket by mail provider unit test', () => {
    let service: ZendeskTicketEmailProvider;

    beforeEach(() => {
        service = Container.get<ZendeskTicketEmailProvider>(Types.ZendeskTicketEmailProvider);
    });

    describe('isZendeskEmail', () => {
        test('should return true when email is from zendesk', () => {
            const email = { body: 'ticket: https://zendesk.com/agent/tickets/451258' } as IEmail;

            expect(service.isZendeskEmail(email)).toBeTruthy();
        });

        test('should return false when email is not from zendesk', () => {
            const email = { body: 'get your free sockets today!' } as IEmail;

            expect(service.isZendeskEmail(email)).toBeFalsy();
        });
    });

    describe('toTicket', () => {
        let email: IEmail;

        beforeEach(() => {
            email = {
                subject: 'new assignment: Can I remove this item from my cart',
                body: `
                    <p>&nbsp;</p>
                    <table class="MsoNormalTable">
                        <tbody>
                            <tr>
                                <td><p>this ticket has been assigned to group "group_name", of which you are a member</p></td>
                                <td><p>link to ticket: https://zendesk.com/agent/tickets/451258</p></td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="MsoNormalTable">
                        <tbody>
                            <tr>
                                <td><p>Hello, I need some help</p></td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="MsoNormalTable">
                        <tbody>
                            <tr>
                                <td><p>submitted from www.xxx.com</p></td>
                            </tr>
                        </tbody>
                    </table>
                    <p>&nbsp;</p>
                    <p>&nbsp;</p>
                `,
                created: new Date(2019, 10, 5),
                from: { name: 'requester_name' },
                to: [{}, {}, {}] as IUser[]
            };
        });

        test('should convert zendesk email into zendesk ticket', () => {
            const message = `
                <table class="MsoNormalTable">
                <tbody>
                    <tr>
                        <td><p>this ticket has been assigned to group "group_name", of which you are a member</p></td>
                        <td><p>link to ticket: https://zendesk.com/agent/tickets/451258</p></td>
                    </tr>
                </tbody>
                </table>
                <table class="MsoNormalTable">
                    <tbody>
                        <tr>
                            <td><p>Hello, I need some help</p></td>
                        </tr>
                    </tbody>
                </table>
            `;

            const ticket = service.toTicket(email);

            expect(ticket.id).toBe('451258');
            expect(ticket.title).toBe('Can I remove this item from my cart');
            expect(removeWhiteSpace(ticket.htmlContent)).toBe(removeWhiteSpace(message));
            expect(ticket.createdOn.getTime()).toBe(new Date(2019, 10, 5).getTime());
            expect(ticket.url).toBe('https://zendesk.com/agent/tickets/451258');
            expect(ticket.status).toBe('opened');
            expect(ticket.requester.name).toBe('requester_name');
            expect(ticket.group).toBe('group_name');
            expect(ticket.assignee.length).toBe(3);
            expect(ticket.assignedToUser).toBeFalsy();
        });

        test('should properly parse ticket status', () => {
            email.body = email.body.replace('assigned to group "group_name"', 'has been reopened');

            const ticket = service.toTicket(email);

            expect(ticket.status).toBe('reopened');
        });

        test('should properly set default value for missing fields', () => {
            email.body = email.body.replace('assigned to group "group_name"', 'has been reopened');
            email.body = email.body.replace('https://zendesk.com/agent/tickets/451258', 'www.google.ca');

            const ticket = service.toTicket(email);

            expect(ticket.url).toBe('');
            expect(ticket.group).toBe('');
        });
    });
});

function removeWhiteSpace(text: string): string {
    return text.replace(/>\s*</g, '><').trim();
}
