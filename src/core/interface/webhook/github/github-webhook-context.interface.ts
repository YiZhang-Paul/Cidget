export default interface IGithubWebhookContext {
    callback: string;
    project: string;
    events: string[];
}
