export default interface ICommit {
    branch: string;
    message: string;
    time: Date;
    diffUrl: string;
    commitUrl: string;
    added?: string[];
    removed?: string[];
    modified?: string[];
}
