import TimeUtility from './time-utility';

describe('time utility unit test', () => {

    describe('fromNow', () => {
        test('should return time from now', () => {
            const result = TimeUtility.fromNow(59999);

            expect(result.getTime() - Date.now()).toBeGreaterThanOrEqual(59999);
            expect(result.getTime() - Date.now()).toBeLessThanOrEqual(60001);
        });
    });

    describe('elapsedTime', () => {
        test('should return elapsed time', () => {
            const milliseconds = 3600 * 1000 * 2 + 60 * 1000 * 15 + 4499;
            const start = new Date(2020, 1, 1);
            const end = new Date(start.getTime() + milliseconds);

            const [hours, minutes, seconds] = TimeUtility.elapsedTime(start, end);

            expect(hours).toBe(2);
            expect(minutes).toBe(15);
            expect(seconds).toBe(4);
        });
    });

    describe('elapsedSeconds', () => {
        test('should return elapsed seconds', () => {
            const milliseconds = 3600 * 1000 * 2 + 60 * 1000 * 15 + 4499;
            const start = new Date(2020, 1, 1);
            const end = new Date(start.getTime() + milliseconds);

            const result = TimeUtility.elapsedSeconds(start, end);

            expect(result).toBe(8104.499);
        });
    });

    describe('elapsedMilliseconds', () => {
        test('should return elapsed milliseconds', () => {
            const milliseconds = 3600 * 1000 * 2 + 60 * 1000 * 15 + 4499;
            const start = new Date(2020, 1, 1);
            const end = new Date(start.getTime() + milliseconds);

            const result = TimeUtility.elapsedMilliseconds(start, end);

            expect(result).toBe(milliseconds);
        });
    });
});
