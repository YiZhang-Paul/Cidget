import IRepository from './repository.interface';

import IUser from '../../general/user.interface';

export default interface IBuildPipeline {
    name: string;
    id: number;
    project: { id: string; name: string };
    owner: IUser;
    createdOn: Date;
    repository: IRepository;
}
