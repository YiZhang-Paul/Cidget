export default class Logger {

    public log(a: any = '', ...b: any[]): void {
        const environment = process.env.APP_ENV;

        if (environment !== 'production' && environment !== 'test') {
            // eslint-disable-next-line
            console.log(a, ...b);
        }
    }
}

export const logger = new Logger();
