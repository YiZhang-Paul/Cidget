import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './step-summary.scss';

@Component
export default class StepSummary extends tsx.Component<any> {
    @Prop({ default: [] }) public steps!: { name: string; scale: number, isActive: boolean }[];
    @Prop({ default: true }) public blinkMode!: boolean;

    private get stepGrids(): any {
        return this.steps.map(_ => {
            const noColor = this.blinkMode && _.isActive && !this.$data.colorOn;
            const color = noColor ? 'no-color' : this.getColor(_.scale);

            return (
                <el-tooltip placement="top" effect="light" content={_.name}>
                    <i class={`fas fa-circle grid ${color}`}></i>
                </el-tooltip>
            )
        });
    }

    private getColor(scale: number): string {
        const colors = ['purple', 'teal', 'grey', 'blue', 'green', 'orange', 'red'];

        return colors[Math.min(colors.length - 1, Math.max(0, scale))];
    }

    public data(): any {
        return ({
            blinking: true,
            colorOn: true
        });
    }

    public mounted(): void {
        if (!this.blinkMode) {
            return;
        }

        const loop = () => {
            if (this.$data.blinking) {
                this.$data.colorOn = !this.$data.colorOn;
                setTimeout(loop, 350);
            }
        };
        loop();
    }

    public destroyed(): void {
        this.$data.blinking = false;
    }

    public render(): any {
        return (<div class="step-summary-container">{this.stepGrids}</div>);
    }
}
