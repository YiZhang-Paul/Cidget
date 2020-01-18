import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './text-summary.scss';

@Component
export default class TextSummary extends tsx.Component<any> {
    @Prop() public summary!: string;
    @Prop() public detail!: string;

    public render(): any {
        return (
            <div class="text-summary-container">
                <div class="summary">{this.summary}</div>
                <div class="detail">{this.detail}</div>
            </div>
        );
    }
}
