import IUser from '../../interface/general/user.interface';

export default interface IReleasePipeline {
    name: string;
    id: number;
    project: string;
    triggeredBy: string;
    owner: IUser;
    createdOn: Date;
}
