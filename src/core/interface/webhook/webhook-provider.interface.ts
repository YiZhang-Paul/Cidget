import IWebhook from '../webhook/webhook.interface';

export default interface IWebhookProvider<TQuery, TContext> {
    listWebhooks(query: TQuery): Promise<IWebhook[]>;
    getWebhook(query: TQuery): Promise<IWebhook | null>;
    addWebhook(context: TContext): Promise<IWebhook>;
}
