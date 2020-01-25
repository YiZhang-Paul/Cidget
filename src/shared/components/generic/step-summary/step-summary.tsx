import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './step-summary.scss';

@Component
export default class StepSummary extends tsx.Component<any> {
    @Prop({ default: [] }) public steps!: { name: string; scale: number }[];

    private get stepGrids(): any {
        return this.steps.map(_ => (
            <el-tooltip placement="top-start" effect="light" content={_.name}>
                <i class={`fas fa-circle grid ${this.getColor(_.scale)}`}></i>
            </el-tooltip>
        ));
    }

    private getColor(scale: number): string {
        const colors = ['purple', 'teal', 'grey', 'blue', 'green', 'orange', 'red'];

        return colors[Math.min(colors.length - 1, Math.abs(scale))];
    }

    public render(): any {
        return (<div class="step-summary-container">{this.stepGrids}</div>);
    }
}
