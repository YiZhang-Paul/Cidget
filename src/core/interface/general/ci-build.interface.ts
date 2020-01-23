export default interface ICiBuild {
    id: string;
    name: string;
    message: string;
    createdOn: Date;
    startedOn: Date;
    finishedOn?: Date;
    url: string;
    status: string;
    result?: string;
    pipeline: { id: string; name: string; url: string };
    repository: { type: string; name: string; branch: string };
}
