import { assert as sinonExpect, spy } from 'sinon';

import axios from '../../../../mocks/axios';
import Types from '../../../ioc/types';
import Container from '../../../ioc/container';
import IHttpClient from '../../../interface/general/http-client.interface';

import HttpClient from './http-client';

describe('http client service unit test', () => {
    let service: HttpClient;
    let getSpy: any;
    let postSpy: any;

    beforeEach(() => {
        service = Container.get<IHttpClient>(Types.IHttpClient);
        getSpy = spy(axios, 'get');
        postSpy = spy(axios, 'post');
    });

    afterEach(() => {
        getSpy.restore();
        postSpy.restore();
    });

    describe('get', () => {
        test('should delegate', () => {
            const options = { headers: { Authorization: 'bearer xxx.xxxx.xxx' } };
            service.get('example_url', options);

            sinonExpect.calledOnce(getSpy);
            sinonExpect.calledWith(getSpy, 'example_url', options);
        });
    });

    describe('post', () => {
        test('should delegate', () => {
            const body = { name: 'example_name' };
            const options = { headers: { Authorization: 'bearer xxx.xxxx.xxx' } };
            service.post('example_url', body, options);

            sinonExpect.calledOnce(postSpy);
            sinonExpect.calledWith(postSpy, 'example_url', body, options);
        });
    });
});
