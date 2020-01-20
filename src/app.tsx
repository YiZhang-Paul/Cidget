import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { mapGetters } from 'vuex';

import ICommit from './core/interface/general/commit.interface';
import IPullRequest from './core/interface/general/pull-request.interface';
import IGithubUser from './core/interface/repository/github/github-user.interface';
import PullRequestCard from './features/github/pull-request-card/pull-request-card';
import CommitCard from './features/github/commit-card/commit-card';
import Store from './store';

@Component({
    computed: {
        ...mapGetters(Store.githubStoreName, {
            _commits: 'getCommits',
            _pullRequests: 'getPullRequests'
        })
    }
})
export default class App extends tsx.Component<any> {
    @Ref('cards') private _cards: any;
    private _commits!: ICommit<IGithubUser>[];
    private _pullRequests!: IPullRequest<IGithubUser>[];

    private getCard(props: any): any {
        const { type, id } = props.item.data;

        switch(type) {
            case 'commit':
                return this.getCommitCard(id, props.close);
            case 'pull-request':
                return this.getPullRequestCard(id, props.close);
        }

        return null;
    }

    private updatePullRequestCard(id: string): void {
        const cards = this._cards._data.list.filter((_: any) => _.data.id === id);

        if (cards.length !== 2) {
            return;
        }
        const [current, previous] = cards;
        // destroy out of date card
        this._cards.destroyById(previous.id);
        // move up to date card to start of the list and reuse previous id for animation
        const index = this._cards._data.list.findIndex((_: any) => _.data.id === id);
        this._cards._data.list.splice(index, 1);
        this._cards._data.list.unshift(current);
        current.id = previous.id;
    }

    private getCommitCard(id: string, closeHandler: any): any {
        const commit = this._commits.find(_ => _.id === id);
        const close = <i class="fas fa-times-circle close" onClick={closeHandler}></i>
        const commitCard = <CommitCard commit={commit} />;

        return commit ? <div class="notification-wrapper">{close}{commitCard}</div> : null;
    }

    private getPullRequestCard(id: string, closeHandler: any): any {
        this.updatePullRequestCard(id);
        const pullRequest = this._pullRequests.find(_ => _.id === id);
        const close = <i class="fas fa-times-circle close" onClick={closeHandler}></i>
        const pullRequestCard = <PullRequestCard pullRequest={pullRequest} />;

        return pullRequest ? <div class="notification-wrapper">{close}{pullRequestCard}</div> : null;
    }

    public render(): any {
        return (
            <notifications class="notification"
                ref="cards"
                group="notification"
                position="top left"
                width={640}
                scopedSlots={{ body: (_: any) => this.getCard(_) }}>
            </notifications>
        );
    }
}
