export default interface ICommit {
    message: string;
    time: Date;
    diffUrl: string;
    commitUrl: string;
    added?: string[];
    removed?: string[];
    modified?: string[];
}
