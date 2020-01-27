export default interface IAzureDevopsWebhookContext {
    publisherId: string;
    eventType: string;
    isRelease: boolean;
    project?: string;
    callback: string;
}
