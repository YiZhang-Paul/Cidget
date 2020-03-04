export default interface IHttpClient {
    get<T = any>(url: string, options?: any): Promise<T>;
    post<T = any>(url: string, body?: any, options?: any): Promise<T>;
}
