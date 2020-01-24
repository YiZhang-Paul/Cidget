export default interface ICdRelease {
    id: string;
    name: string;
    status: string;
    createdOn: Date;
    url: string;
    commits?: number;
    project: string;
    stages?: { name: string; status: string; }[];
    pipeline: { id: string; name: string; url: string };
    triggeredBy: { name: string; url: string; };
}
