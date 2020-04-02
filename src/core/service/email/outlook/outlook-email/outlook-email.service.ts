import { injectable } from 'inversify';

import IUser from '../../../../interface/generic/user.interface';
import IEmail from '../../../../interface/generic/email.interface';

@injectable()
export default class OutlookEmailService {

    public toMail(data: any): IEmail {
        const { subject, body, sentDateTime, from, toRecipients } = data;

        return ({
            subject,
            body: body.content,
            created: new Date(sentDateTime),
            from: this.getUser(from),
            to: toRecipients.map(this.getUser.bind(this))
        }) as IEmail;
    }

    private getUser(data: any): IUser {
        const { emailAddress } = data;

        return ({
            name: emailAddress.name,
            email: emailAddress.address
        });
    }
}
