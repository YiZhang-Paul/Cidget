import IUser from '../../generic/user.interface';
import IRepository from '../repository.interface';

export default interface ICommit<TUser = IUser, TRepository = IRepository> {
    id: string;
    initiator: TUser;
    repository: TRepository;
    branch: string;
    message: string;
    time: Date;
    diffUrl: string;
    commitUrl: string;
    added?: string[];
    removed?: string[];
    modified?: string[];
}
