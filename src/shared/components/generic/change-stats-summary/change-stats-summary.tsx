import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './change-stats-summary.scss';

@Component
export default class ChangeStatsSummary extends tsx.Component<any> {
    @Prop() public added!: number;
    @Prop() public removed!: number;
    @Prop() public modified!: number;

    private get add(): string {
        return this.approximate(this.added);
    }

    private get remove(): string {
        return this.approximate(this.removed);
    }

    private get modify(): string {
        return this.approximate(this.modified);
    }

    private approximate(value: number): string {
        return value > 1000 ? `${Math.round(value / 1000 * 10) / 10}k` : String(value);
    }

    public render(): any {
        return (
            <div class="change-stats-summary-container">
                <span> <i class="el-icon-caret-top add"></i>{this.add}</span>
                <span> <i class="el-icon-caret-bottom remove"></i>{this.remove}</span>
                <span> <i class="el-icon-d-caret modify"></i>{this.modify}</span>
            </div>
        );
    }
}
