import IUser from '../generic/user.interface';

export default interface ISupportTicket {
    id: string;
    title: string;
    content: string;
    htmlContent: string;
    createdOn: Date;
    url: string;
    status: string;
    requester: IUser;
    group: string;
    assignee: IUser[];
    assignedToUser: boolean;
}
