import IRepository from './repository.interface';

export default interface IRepositoryProvider<TContext> {
    listRepositories(): Promise<IRepository[]>;
    listRepository(name: string): Promise<IRepository | null>;
    toRepository(data: any): IRepository;
}
