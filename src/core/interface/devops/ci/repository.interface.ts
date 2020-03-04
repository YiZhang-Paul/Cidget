import IUser from '../../general/user.interface';

export default interface IRepository {
    name: string;
    type: string;
    defaultBranch?: string;
    organization: IUser;
}
