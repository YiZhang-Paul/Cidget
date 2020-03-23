import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { remote } from 'electron';

import NotificationType from './core/enum/notification-type.enum';
import SupportTicketCard from './features/zendesk/support-ticket-card/support-ticket-card';
import BuildPipelineCard from './features/azure-devops/build-pipeline-card/build-pipeline-card';
import ReleasePipelineCard from './features/azure-devops/release-pipeline-card/release-pipeline-card';
import CommitCard from './features/github/commit-card/commit-card';
import PullRequestCard from './features/github/pull-request-card/pull-request-card';

@Component
export default class App extends tsx.Component<any> {
    @Ref('cards') private _cards: any;

    public mounted(): void {
        const original = this._cards.destroy;
        // monkey patch destroy() to play exit animation on card exit
        this._cards.destroy = (item: any) => {
            const identifier = this.getIdentifier(item.data);

            if (!this.$refs[identifier]) {
                original(item);

                return;
            }
            const instance: any = this.$refs[identifier];
            const notificationCard = instance.$children[0];
            const list = this._cards.$data.list;
            const isDuplicate = list.filter((_: any) => _.data.id === item.data.id).length === 2;

            if (!notificationCard || notificationCard.$data.closing && !isDuplicate) {
                original(item);

                return;
            }

            if (notificationCard.$data.closing && isDuplicate) {
                return;
            }
            notificationCard.$data.closing = true;
            setTimeout(() => original(item), 1000);
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
        return `${data.type}_card_${data.id}`;
    }

    private removeDuplicate(id: string): void {
        const cards = this._cards.$data.list.filter((_: any) => _.data.id === id);

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

    private getEventCard(props: any, className: string): any {
        const { type, model } = props.item.data;

        switch (type) {
            case NotificationType.SupportTicket:
                return <SupportTicketCard ref={className} class={className} ticket={model} closeHandler={props.close} />;
            case NotificationType.CiBuild:
                return <BuildPipelineCard ref={className} class={className} build={model} closeHandler={props.close} />;
            case NotificationType.CdRelease:
                return <ReleasePipelineCard ref={className} class={className} release={model} closeHandler={props.close} />;
            case NotificationType.Commit:
                return <CommitCard ref={className} class={className} commit={model} closeHandler={props.close} />;
            case NotificationType.PullRequest:
                return <PullRequestCard ref={className} class={className} pullRequest={model} closeHandler={props.close} />;
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
