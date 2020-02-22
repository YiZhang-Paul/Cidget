import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import TextSummary from '../text-summary/text-summary';

import './relative-time-display.scss';

@Component
export default class RelativeTimeDisplay extends tsx.Component<any> {
    @Prop({ default: () => new Date() }) public time!: Date;

    private get relativeTime(): string {
        const checks: [string, number][] = [
            ['year', 60 * 60 * 24 * 364.5 - 1],
            ['month', 60 * 60 * 24 * 29.5 - 1],
            ['day', 60 * 60 * 23.5 - 1],
            ['hour', 60 * 59.5 - 1],
            ['minute', 59]
        ];

        const [now, past] = [this.$data.now, this.time];
        const passed = Math.round((now.getTime() - past.getTime()) / 1000);
        const [unit, threshold] = checks.find(_ => passed > _[1]) || ['second', 0];
        const total = Math.round(passed / (threshold + 1));

        return `${total} ${unit}${total > 1 ? 's' : ''}`;
    }

    private get absoluteTime(): string {
        const relativeTime = this.relativeTime;
        const localeTime = this.time.toLocaleTimeString();

        if (/1 day$|(hour|second)s?$/.test(relativeTime)) {
            return `${/1 day/.test(relativeTime) ? 'yesterday' : 'today'} ${localeTime}`;
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
