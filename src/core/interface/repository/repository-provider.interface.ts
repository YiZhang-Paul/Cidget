import IWebhook from '../general/webhook.interface';
import IRepository from '../repository/repository.interface';

export default interface IRepositoryProvider<TContext> {
    listRepositories(): Promise<IRepository[]>;
    listRepository(project: string): Promise<IRepository | null>;
    listWebhooks(project: string): Promise<IWebhook[]>;
    getWebhook(project: string, callback: string): Promise<IWebhook | null>;
    addWebhook(project: string, context: TContext): Promise<IWebhook>;
}
