import IUser from '../general/user.interface';

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
    language: { name: string; abbr: string };
    license?: { name: string; abbr: string };
}
