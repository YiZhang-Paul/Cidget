import { assert as sinonExpect, spy } from 'sinon';

import Types from '../../../../ioc/types';
import Container from '../../../../ioc/container';
import { webApiStubInstance } from '../../../../../mocks/azure-devops-node-api';

import AzureDevopsApiProvider from './azure-devops-api-provider.service';

describe('azure devops api provider service unit test', () => {
    let service: AzureDevopsApiProvider;
    let getBuildApiSpy: any;
    let getReleaseApiSpy: any;

    beforeEach(() => {
        service = Container.get<AzureDevopsApiProvider>(Types.AzureDevopsApiProvider);
        getBuildApiSpy = spy(webApiStubInstance, 'getBuildApi');
        getReleaseApiSpy = spy(webApiStubInstance, 'getReleaseApi');
    });

    afterEach(() => {
        getBuildApiSpy.restore();
        getReleaseApiSpy.restore();
    });

    describe('getBuildApi', () => {
        test('should delegate', () => {
            service.getBuildApi();

            sinonExpect.calledOnce(getBuildApiSpy);
        });
    });

    describe('getReleaseApi', () => {
        test('should delegate', () => {
            service.getReleaseApi();

            sinonExpect.calledOnce(getReleaseApiSpy);
        });
    });
});
