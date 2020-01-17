import IWebhook from '../general/webhook.interface';
import IRepository from '../repository/repository.interface';

export default interface IRepositoryProvider<TContext> {
    listRepositories(): Promise<IRepository[]>;
    listRepository(name: string): Promise<IRepository | null>;
    listWebhooks(name: string): Promise<IWebhook[]>;
    getWebhook(name: string, callback: string): Promise<IWebhook | null>;
    addWebhook(name: string, context: TContext): Promise<IWebhook>;
}
