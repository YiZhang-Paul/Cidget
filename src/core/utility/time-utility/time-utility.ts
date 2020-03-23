export default class TimeUtility {

    public static fromNow(milliseconds: number): Date {
        return new Date(Date.now() + milliseconds);
    }

    public static relativeTimeString(start: Date, end: Date | null = null): string {
        const thresholds: [string, number][] = [
            ['year', 60 * 60 * 24 * 364.5 - 1],
            ['month', 60 * 60 * 24 * 29.5 - 1],
            ['day', 60 * 60 * 23.5 - 1],
            ['hour', 60 * 59.5 - 1],
            ['minute', 59]
        ];

        const elapsed = this.elapsedSeconds(start, end);
        const [unit, threshold] = thresholds.find(_ => elapsed > _[1]) ?? ['second', 0];
        const total = Math.round(elapsed / (threshold + 1));

        return `${total} ${unit}${total > 1 ? 's' : ''}`;
    }

    public static toShortTimeString(time: Date): string {
        const month = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        return `${month[time.getMonth()]} ${time.getDate()} ${time.toLocaleTimeString()}`;
    }

    public static elapsedTime(start: Date, end: Date | null = null): [number, number, number] {
        const elapsed = this.elapsedSeconds(start, end);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor(elapsed % 3600 / 60);
        const seconds = elapsed % 3600 % 60;

        return [hours, minutes, seconds];
    }

    public static elapsedSeconds(start: Date, end: Date | null = null): number {
        return this.elapsedMilliseconds(start, end) / 1000;
    }

    public static elapsedMilliseconds(start: Date, end: Date | null = null): number {
        return (end?.getTime() ?? Date.now()) - start.getTime();
    }
}
