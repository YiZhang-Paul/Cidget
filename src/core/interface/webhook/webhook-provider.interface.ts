import IWebhook from '../webhook/webhook.interface';

export default interface IWebhookProvider<TContext> {
    listWebhooks(name: string): Promise<IWebhook[]>;
    getWebhook(name: string, callback: string): Promise<IWebhook | null>;
    addWebhook(name: string, context: TContext): Promise<IWebhook>;
}
