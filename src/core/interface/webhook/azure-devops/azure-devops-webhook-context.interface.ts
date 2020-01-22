export default interface IAzureDevopsWebhookContext {
    publisherId: string;
    eventType: string;
    project?: string;
    callback: string;
}
