import IUser from '../../interface/general/user.interface';
import IRepository from './repository.interface';

export default interface IBuildPipeline {
    name: string;
    id: number;
    project: { id: string; name: string };
    owner: IUser;
    createdOn: Date;
    repository: IRepository;
}
