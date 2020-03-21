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

        this._cards.destroy = (item: any) => {
            const identifier = this.getIdentifier(item.data);

            if (!this.$refs[identifier]) {
                original(item);

                return;
            }
            const instance: any = this.$refs[identifier];
            const notificationCard = instance.$children[0];

            if (notificationCard) {
                const delay = notificationCard.$data.closing ? 0 : 1000;
                notificationCard.$data.closing = true;
                setTimeout(() => original(item), delay);
            }
        };
    }

    private getNotificationCard(props: any): any {
        const { data } = props.item;
        const { id } = data;
        const identifier = this.getIdentifier(data);
        remote.getCurrentWindow().moveTop();

        if (this.updateCard(id)) {
            this.applyEffect(identifier);

            return null;
        }

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

    private updateCard(id: string): boolean {
        const cards = this._cards.$data.list.filter((_: any) => _.data.id === id);

        if (cards.length !== 2) {
            return false;
        }
        const [current, previous] = cards;
        // destroy out of date card
        this._cards.destroyById(previous.id);
        // move up to date card to start of the list and reuse previous id for animation
        const index = this._cards.$data.list.findIndex((_: any) => _.data.id === id);
        this._cards.$data.list.splice(index, 1);
        this._cards.$data.list.unshift(current);
        current.id = previous.id;

        return true;
    }

    private applyEffect(id: string, effectClass = 'updated-card'): void {
        const elements = document.getElementsByClassName(id);

        Array.prototype.forEach.call(elements, _ => {
            _.classList.remove(effectClass);
            setTimeout(() => _.classList.add(effectClass));
        });
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
