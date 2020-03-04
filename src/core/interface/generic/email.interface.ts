import IUser from './user.interface';

export default interface IEmail {
    subject: string;
    body: string;
    created: Date;
    from: IUser;
    to: IUser[];
}
