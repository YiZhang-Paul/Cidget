import { assert as sinonExpect, stub } from 'sinon';

import Logger from './logger';

describe('logger unit test', () => {
    let logger: Logger;
    let logStub: any;

    beforeEach(() => {
        logStub = stub(console, 'log');
        logger = new Logger();
    });

    afterEach(() => {
        logStub.restore();
    });

    describe('log', () => {
        test('should log', () => {
            process.env.APP_ENV = 'development';

            logger.log();

            sinonExpect.calledOnce(logStub);
        });

        test('should not log under production mode', () => {
            process.env.APP_ENV = 'production';

            logger.log();

            sinonExpect.notCalled(logStub);
        });

        test('should not log under test mode', () => {
            process.env.APP_ENV = 'test';

            logger.log();

            sinonExpect.notCalled(logStub);
        });
    });
});
