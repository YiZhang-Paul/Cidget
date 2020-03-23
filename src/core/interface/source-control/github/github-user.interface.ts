import IUser from '../../generic/user.interface';

export default interface IGithubUser extends IUser {
    profileUrl: string;
    repositoryCount: number;
    followerCount: number;
    gistCount: number;
    gistUrl: string;
}
