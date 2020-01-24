import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import './branch-badge.scss';

@Component
export default class BranchBadge extends tsx.Component<any> {
    @Prop() public name!: string;
    @Prop() public url!: string;
    @Prop({ default: false }) public disabled!: boolean;

    private toLink(): void {
        if (!this.disabled) {
            shell.openExternal(this.url);
        }
    }

    public render(): any {
        const className = this.disabled ? 'disabled' : 'enabled';

        return (
            <div class={`branch-badge-container ${className}`}>
                <a class="url" onClick={this.toLink}>
                    <i class="fas fa-code-branch"></i>{this.name}
                </a>
            </div>
        );
    }
}
