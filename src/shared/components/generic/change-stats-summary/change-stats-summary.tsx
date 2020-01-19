import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './change-stats-summary.scss';

@Component
export default class ChangeStatsSummary extends tsx.Component<any> {
    @Prop() public added!: number;
    @Prop() public removed!: number;
    @Prop() public modified!: number;

    public render(): any {
        return (
            <div class="change-stats-summary-container">
                <span> <i class="el-icon-caret-top add"></i>{this.added}</span>
                <span> <i class="el-icon-caret-bottom remove"></i>{this.removed}</span>
                <span> <i class="el-icon-d-caret modify"></i>{this.modified}</span>
            </div>
        );
    }
}
