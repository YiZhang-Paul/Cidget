import * as axios from 'axios';
import { injectable } from 'inversify';

import IHttpClient from '../../../interface/general/http-client.interface';

@injectable()
export default class HttpClient implements IHttpClient {

    public async get<T>(url: string, options: any): Promise<T> {
        return await axios.default.get(url, options);
    }

    public async post<T>(url: string, body: any, options: any): Promise<T> {
        return await axios.default.post(url, body, options);
    }
}
