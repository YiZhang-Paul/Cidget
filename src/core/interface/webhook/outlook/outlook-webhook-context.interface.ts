export default interface IOutlookWebhookContext {
    events: string[];
    callback: string;
    resource: string;
    state: string;
}
