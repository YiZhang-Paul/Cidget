import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import WeblinkDisplay from '../../generic/weblink-display/weblink-display';

import './branch-badge.scss';

@Component
export default class BranchBadge extends tsx.Component<any> {
    @Prop() public name!: string;
    @Prop() public url!: string;
    @Prop({ default: false }) public disabled!: boolean;

    public render(): any {
        const className = this.disabled ? 'disabled' : 'enabled';

        return (
            <WeblinkDisplay class={`branch-badge-container ${className}`}
                text={this.name}
                url={this.disabled ? '' : this.url}
                noTooltip={true}>
                <i class="fas fa-code-branch branch-icon"></i>
            </WeblinkDisplay>
        );
    }
}
