export default interface IWebhook {
    id: string;
    name: string;
    url: string;
    project?: string;
    callback: string;
    contentType: string;
    events: string[];
    createdOn: Date;
    isActive: boolean;
}
