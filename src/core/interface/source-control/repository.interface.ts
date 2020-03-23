import IUser from '../generic/user.interface';

export default interface IRepository {
    id: string;
    name: string;
    description?: string;
    owner: IUser;
    url: string;
    isPrivate: boolean;
    createdOn: Date;
    defaultBranch?: string;
    hooksUrl: string;
    language: string;
    license?: string;
}
