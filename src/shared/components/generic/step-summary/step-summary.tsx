import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './step-summary.scss';

@Component
export default class StepSummary extends tsx.Component<any> {
    @Prop() public steps!: { name: string; scale: number }[];

    private get stepGrids(): any {
        return this.steps.map(_ => (
            <el-tooltip placement="top-start" effect="light" content={_.name}>
                <div class={`grid ${this.getColor(_.scale)}`}></div>
            </el-tooltip>
        ));
    }

    private getColor(scale: number): string {
        const colors = ['white', 'grey', 'blue', 'green', 'orange', 'red'];

        return colors[Math.min(colors.length - 1, Math.abs(scale))];
    }

    public render(): any {
        return (<div class="step-summary-container">{this.stepGrids}</div>);
    }
}
