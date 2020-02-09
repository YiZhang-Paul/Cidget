import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import WeblinkDisplay from '../../generic/weblink-display/weblink-display';

import './conversation-preview-badge.scss';

@Component
export default class ConversationPreviewBadge extends tsx.Component<any> {
    @Prop() public username!: string;
    @Prop() public conversation!: string;

    public render(): any {
        return (
            <WeblinkDisplay class="conversation-preview-badge-container"
                text={`${this.username}: ${this.conversation}`}
                tooltip={this.conversation}
                tooltipPosition={'bottom'}>
                <i class="fas fa-user-ninja user-icon"></i>
            </WeblinkDisplay>
        );
    }
}
