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

        const passed = (Date.now() - this.time.getTime()) / 1000;
        const [unit, threshold] = checks.find(_ => passed >= _[1]) || ['second', 1];
        const total = Math.round(passed / threshold);

        return `${total} ${unit}${total > 1 ? 's' : ''} ago`;
    }

    public render(): any {
        return (
            <TextSummary class="relative-time-display"
                summary={this.relativeTime}
                detail={this.time.toLocaleTimeString()}>
            </TextSummary>
        );
    }
}
