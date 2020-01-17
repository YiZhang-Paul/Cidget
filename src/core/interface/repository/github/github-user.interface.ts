import IUser from '../../general/user.interface';

export default interface IGithubUser extends IUser {
    profileUrl: string;
    gistCount: number;
    gistUrl: string;
}
