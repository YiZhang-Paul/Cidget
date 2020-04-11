import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { remote } from 'electron';

import NotificationType from './core/enum/notification-type.enum';
import SupportTicketCard from './features/customer-support/support-ticket-card/support-ticket-card';
import BuildPipelineCard from './features/devops/build-pipeline-card/build-pipeline-card';
import ReleasePipelineCard from './features/devops/release-pipeline-card/release-pipeline-card';
import CommitCard from './features/source-control/commit-card/commit-card';
import PullRequestCard from './features/source-control/pull-request-card/pull-request-card';

const log = require('electron-log');

@Component
export default class App extends tsx.Component<any> {
    @Ref('cards') private _cards: any;

    public mounted(): void {
        const destroy = this._cards.destroy;
        // monkey patch destroy() to play exit animation on card exit
        this._cards.destroy = (item: any) => {
            const identifier = this.getIdentifier(item.data);

            if (!this.$refs[identifier]) {
                destroy(item);

                return;
            }
            const instance: any = this.$refs[identifier];
            const notificationCard = instance.$children[0];

            if (!notificationCard.$data.closing) {
                notificationCard.$data.closing = true;
                setTimeout(() => destroy(item), 1000);
            }
        };
    }

    private getNotificationCard(props: any): any {
        const { data } = props.item;
        const { id } = data;
        const identifier = this.getIdentifier(data);
        remote.getCurrentWindow().moveTop();
        this.removeDuplicate(id);

        return (
            <div class="notification-wrapper"
                onMouseenter={() => this.stopTimer(id)}
                onMouseleave={() => this.restoreTimer(id)}>

                {this.getEventCard(props, identifier)}
            </div>
        );
    }

    private getIdentifier(data: any): string {
        const { type, id, counter } = data;

        return `${type}_card_${id}_${counter}`;
    }

    private removeDuplicate(id: string): void {
        const cards = this._cards.$data.list.filter((_: any) => _.data.id === id);

        if (cards.length > 2) {
            log.error('More than 2 duplicate notification cards found.');
        }

        if (cards.length === 2) {
            this._cards.destroy(cards[1]);
        }
    }

    private stopTimer(id: string): void {
        const card = this._cards.$data.list.find((_: any) => _.data.id === id);

        if (!card) {
            return;
        }

        if (card.timer !== undefined && card.timer !== null) {
            clearTimeout(card.timer);
            card.timer = null;
        }
    }

    private restoreTimer(id: string): void {
        const card = this._cards.$data.list.find((_: any) => _.data.id === id);

        if (!card) {
            return;
        }
        const duration = card.length - card.speed * 2;

        if (card.timer === null && duration >= 0) {
            card.timer = setTimeout(() => this._cards.destroy(card), duration);
        }
    }

    private getEventCard(props: any, identifier: string): any {
        const { type, logoUrl, model } = props.item.data;

        switch (type) {
            case NotificationType.SupportTicket:
                return (
                    <SupportTicketCard ref={identifier}
                        ticket={model}
                        logoUrl={logoUrl}
                        closeHandler={props.close}>
                    </SupportTicketCard>
                );
            case NotificationType.CiBuild:
                return (
                    <BuildPipelineCard ref={identifier}
                        build={model}
                        logoUrl={logoUrl}
                        closeHandler={props.close}>
                    </BuildPipelineCard>
                );
            case NotificationType.CdRelease:
                return (
                    <ReleasePipelineCard ref={identifier}
                        release={model}
                        logoUrl={logoUrl}
                        closeHandler={props.close}>
                    </ReleasePipelineCard>
                );
            case NotificationType.Commit:
                return (
                    <CommitCard ref={identifier}
                        commit={model}
                        logoUrl={logoUrl}
                        closeHandler={props.close}>
                    </CommitCard>
                );
            case NotificationType.PullRequest:
                return (
                    <PullRequestCard ref={identifier}
                        pullRequest={model}
                        logoUrl={logoUrl}
                        closeHandler={props.close}>
                    </PullRequestCard>
                );
        }
    }

    public render(): any {
        return (
            <notifications class="notification"
                ref="cards"
                group="notification"
                position="top left"
                width={600}
                scopedSlots={{ body: this.getNotificationCard }}>
            </notifications>
        );
    }
}
