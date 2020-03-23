import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import TextSummary from '../text-summary/text-summary';
import TimeUtility from '../../../../core/utility/time-utility/time-utility';

import './relative-time-display.scss';

const log = require('electron-log');

@Component
export default class RelativeTimeDisplay extends tsx.Component<any> {
    @Prop({ default: () => new Date() }) public time!: Date;

    private get relative(): string {
        const time = TimeUtility.relativeTimeString(this.time, this.$data.now);

        if (time.startsWith('-')) {
            log.error(`Negative relative time, start: ${this.time}, end: ${this.$data.now}`);
        }
        return time;
    }

    private get absolute(): string {
        const relativeTime = this.relative;

        if (!(/1 day$|(hour|second)s?$/.test(relativeTime))) {
            return TimeUtility.toShortTimeString(this.time);
        }
        const day = /1 day/.test(relativeTime) ? 'yesterday' : 'today';

        return `${day} ${this.time.toLocaleTimeString()}`;
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
                summary={this.relative}
                detail={this.absolute}>
            </TextSummary>
        );
    }
}
