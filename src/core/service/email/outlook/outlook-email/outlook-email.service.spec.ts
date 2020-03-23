import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';

import OutlookEmailService from './outlook-email.service';

describe('outlook email service unit test', () => {
    let service: OutlookEmailService;

    beforeEach(() => {
        service = Container.get<OutlookEmailService>(Types.OutlookEmailService);
    });

    describe('toMail', () => {
        test('should convert payload to email', () => {
            const payload = {
                subject: 'email_subject',
                body: { content: 'email_content' },
                createdDateTime: new Date(2019, 2, 5),
                from: { emailAddress: { name: 'name_1', address: 'address_1' } },
                toRecipients: [
                    { emailAddress: { name: 'name_2', address: 'address_2' } },
                    { emailAddress: { name: 'name_3', address: 'address_3' } }
                ]
            };

            const result = service.toMail(payload);

            expect(result.subject).toBe('email_subject');
            expect(result.body).toBe('email_content');
            expect(result.created.getTime()).toBe(new Date(2019, 2, 5).getTime());
            expect(result.from.name).toBe('name_1');
            expect(result.to.length).toBe(2);
            expect(result.to[0].name).toBe('name_2');
            expect(result.to[1].name).toBe('name_3');
        });
    });
});
