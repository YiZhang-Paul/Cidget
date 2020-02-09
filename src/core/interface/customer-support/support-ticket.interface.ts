import IUser from '../general/user.interface';

export default interface ISupportTicket {
    id: string;
    title: string;
    content: string;
    url: string;
    status: string;
    requester: IUser;
    group: string;
    assignee: IUser[];
    assignedToUser: boolean;
}
