import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import TextSummary from '../text-summary/text-summary';

import './relative-time-display.scss';

@Component
export default class RelativeTimeDisplay extends tsx.Component<any> {
    @Prop({ default: () => new Date() }) public time!: Date;

    private get relativeTime(): string {
        const checks: [string, number][] = [
            ['year', 60 * 60 * 24 * 365],
            ['month', 60 * 60 * 24 * 30],
            ['day', 60 * 60 * 24],
            ['hour', 60 * 60],
            ['minute', 60]
        ];

        const passed = (this.$data.now.getTime() - this.time.getTime()) / 1000;
        const [unit, threshold] = checks.find(_ => passed >= _[1]) || ['second', 1];
        const total = Math.round(passed / threshold);
        const isSecondsAgo = this.$data.timerCounter > 11 && unit === 'second';

        return isSecondsAgo ? 'few seconds ago' : `${total} ${unit}${total > 1 ? 's' : ''} ago`;
    }

    private get absoluteTime(): string {
        const relativeTime = this.relativeTime;
        const localeTime = this.time.toLocaleTimeString();

        if (/1 day ago|hour/.test(relativeTime)) {
            return `${/hour/.test(relativeTime) ? 'today' : 'yesterday'} ${localeTime}`;
        }
        const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dev'];

        return `${month[this.time.getMonth()]} ${this.time.getDate()} ${localeTime}`;
    }

    public data(): any {
        return ({
            timerActive: true,
            timerCounter: 0,
            now: new Date()
        });
    }

    public created(): void {
        const loop = () => {
            if (!this.$data.timerActive) {
                return;
            }
            setTimeout(() => {
                this.$data.now = new Date();
                loop();
            }, ++this.$data.timerCounter <= 60 ? 1000 : 60000);
        }
        loop();
    }

    public beforeDestroy(): void {
        this.$data.timerActive = false;
    }

    public render(): any {
        return (
            <TextSummary class="relative-time-display"
                summary={this.relativeTime}
                detail={this.absoluteTime}>
            </TextSummary>
        );
    }
}
