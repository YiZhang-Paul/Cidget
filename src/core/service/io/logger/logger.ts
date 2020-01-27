export default class Logger {

    public log(a: any = '', ...b: any[]): void {
        if (process.env.APP_ENV !== 'production' && process.env.APP_ENV !== 'test') {
            // eslint-disable-next-line
            console.log(a, ...b);
        }
    }
}

export const logger = new Logger();
