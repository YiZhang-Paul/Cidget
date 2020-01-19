import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import './branch-badge.scss';

@Component
export default class BranchBadge extends tsx.Component<any> {
    @Prop() public name!: string;
    @Prop() public url!: string;

    public render(): any {
        return (
            <div class="branch-badge-container">
                <a class="url" onClick={() => shell.openExternal(this.url)}>
                    <i class="fas fa-code-branch"></i>{this.name}
                </a>
            </div>
        );
    }
}
