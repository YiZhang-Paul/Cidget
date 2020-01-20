import { assert as sinonExpect, spy } from 'sinon';

import Logger from './logger';

describe('logger unit test', () => {
    let logger: Logger;
    let logSpy: any;

    beforeEach(() => {
        logSpy = spy(console, 'log');
        logger = new Logger();
    });

    afterEach(() => {
        logSpy.restore();
    });

    describe('log', () => {
        test('should log', () => {
            process.env.APP_ENV = 'development';

            logger.log();

            sinonExpect.calledOnce(logSpy);
        });

        test('should not log under production mode', () => {
            process.env.APP_ENV = 'production';

            logger.log();

            sinonExpect.notCalled(logSpy);
        });

        test('should not log under test mode', () => {
            process.env.APP_ENV = 'test';

            logger.log();

            sinonExpect.notCalled(logSpy);
        });
    });
});
