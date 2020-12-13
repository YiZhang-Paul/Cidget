import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import ISupportTicket from '../../../core/interface/customer-support/support-ticket.interface';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import ConversationPreviewBadge from '../conversation-preview-badge/conversation-preview-badge';

import './support-ticket-card.scss';

@Component
export default class SupportTicketCard extends tsx.Component<any> {
    @Prop() public ticket!: ISupportTicket;
    @Prop() public logoUrl!: string;
    @Prop() public closeHandler!: () => void;

    private get statusText(): string {
        if (this.ticket.status === 'reopened') {
            return 'Reopened';
        }
        const group = this.ticket.assignedToUser ? 'YOU' : this.ticket.group;
        const assignees = this.ticket.assignee.length;

        return group || `${assignees} assignee${assignees > 1 ? 's' : ''}`;
    }

    public render(): any {
        const rightArrow = <i class="fas fa-arrow-alt-circle-right right-arrow"></i>;
        const highlighted = this.statusText === 'Reopened' || this.statusText === 'YOU';
        const statusTextClass = `status-text ${highlighted ? 'highlighted' : ''}`;
        const htmlTooltip = `<div class="support-ticket-conversation">${this.ticket.htmlContent}</div>`;

        return (
            <NotificationCard time={this.ticket.createdOn} closeHandler={this.closeHandler} logoUrl={this.logoUrl}>
                <div class="ticket-message-container">
                    <WeblinkDisplay class="ticket-message"
                        text={`Ticket #${this.ticket.id}`}
                        noTooltip={true}
                        url={this.ticket.url}>
                    </WeblinkDisplay>

                    {this.statusText === 'Reopened' ? '' : rightArrow}
                    <div class={statusTextClass}>{this.statusText}</div>
                </div>

                <div class="ticket-info-container">
                    <ConversationPreviewBadge class="ticket-info"
                        username={this.ticket.requester.name}
                        conversation={this.ticket.title}
                        tooltip={htmlTooltip}>
                    </ConversationPreviewBadge>
                </div>
            </NotificationCard>
        );
    }
}
