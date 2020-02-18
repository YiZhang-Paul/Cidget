import Container from './core/ioc/container';

beforeEach(() => {
    Container.snapshot();
    jest.useFakeTimers();
});

afterEach(() => {
    Container.restore();
    jest.useRealTimers();
});
