import IRepository from './repository.interface';

import IUser from '../general/user.interface';

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
