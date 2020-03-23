import IUser from '../../generic/user.interface';

export default interface IRepository {
    name: string;
    type: string;
    defaultBranch?: string;
    organization: IUser;
}
