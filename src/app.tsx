import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { remote } from 'electron';

import SupportTicketCard from './features/zendesk/support-ticket-card/support-ticket-card';
import BuildPipelineCard from './features/azure-devops/build-pipeline-card/build-pipeline-card';
import ReleasePipelineCard from './features/azure-devops/release-pipeline-card/release-pipeline-card';
import CommitCard from './features/github/commit-card/commit-card';
import PullRequestCard from './features/github/pull-request-card/pull-request-card';

@Component
export default class App extends tsx.Component<any> {
    @Ref('cards') private _cards: any;

    private getNotificationCard(props: any): any {
        const { type, id } = props.item.data;
        const identifier = `${type}_card_${id}`;
        const onMouseenter = () => this.stopTimer(id);
        const onMouseleave = () => this.restoreTimer(id);
        remote.getCurrentWindow().moveTop();

        if (this.updateCard(id)) {
            this.applyEffect(identifier);

            return null;
        }

        return (
            <div class="notification-wrapper"
                onMouseenter={onMouseenter}
                onMouseleave={onMouseleave}>

                {this.getEventCard(props, identifier)}
            </div>
        );
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
        const callback = () => this._cards.destroy(card);

        if (card.timer === null && duration >= 0) {
            card.timer = setTimeout(callback, duration);
        }
    }

    private getEventCard(props: any, className: string): any {
        const { type, model } = props.item.data;

        switch (type) {
            case 'support-ticket':
                return <SupportTicketCard class={className} ticket={model} closeHandler={props.close} />;
            case 'ci-build':
                return <BuildPipelineCard class={className} build={model} closeHandler={props.close} />;
            case 'cd-release':
                return <ReleasePipelineCard class={className} release={model} closeHandler={props.close} />;
            case 'commit':
                return <CommitCard class={className} commit={model} closeHandler={props.close} />;
            case 'pull-request':
                return <PullRequestCard class={className} pullRequest={model} closeHandler={props.close} />;
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
