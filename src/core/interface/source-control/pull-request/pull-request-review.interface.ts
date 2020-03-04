export default interface IPullRequestReview<TUser> {
    pullRequestId: string;
    reviewer: TUser;
    type: string;
}
