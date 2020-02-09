import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import ISupportTicket from '../../../core/interface/customer-support/support-ticket.interface';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './support-ticket-card.scss';

@Component
export default class SupportTicketCard extends tsx.Component<any> {
    @Prop() public ticket!: ISupportTicket;

    private get statusText(): string {
        if (this.ticket.status === 'reopened') {
            return 'Reopened';
        }
        const group = this.ticket.assignedToUser ? 'YOU' : this.ticket.group;

        return group || `${this.ticket.assignee.length} assignees`;
    }

    public render(): any {
        const rightArrow = <i class="fas fa-arrow-alt-circle-right right-arrow"></i>;
        const highlighted = this.statusText === 'Reopened' || this.statusText === 'YOU';
        const statusTextClass = `status-text ${highlighted ? 'highlighted' : ''}`;

        return (
            <NotificationCard logoUrl={require('../../../../public/images/zendesk-logo.png')}>
                <div class="ticket-message-container">
                    <WeblinkDisplay class="ticket-message"
                        text={`#${this.ticket.id} ${this.ticket.title}`}
                        noTooltip={true}
                        url={this.ticket.url}>
                    </WeblinkDisplay>

                    {this.statusText === 'Reopened' ? '' : rightArrow}
                    <div class={statusTextClass}>{this.statusText}</div>
                </div>

                <div class="ticket-info-container">
                    <WeblinkDisplay class="ticket-info"
                        text={`${this.ticket.requester.name}: ${this.ticket.content}`}
                        tooltip={this.ticket.content}
                        tooltipPosition={'bottom'}>
                        <i class="fas fa-user-ninja requester-icon"></i>
                    </WeblinkDisplay>

                    <RelativeTimeDisplay class="time" time={this.ticket.createdOn} />
                </div>

                <div class="support-ticket-card-actions" slot="actions">
                    <div class="open-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            </NotificationCard>
        );
    }
}
