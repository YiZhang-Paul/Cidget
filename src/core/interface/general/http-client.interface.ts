export default interface IHttpClient {
    get<T>(url: string, options: any): Promise<T>;
    post<T>(url: string, body: any, options: any): Promise<T>;
}
