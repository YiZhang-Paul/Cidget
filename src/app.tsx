import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { mapGetters } from 'vuex';

import ICiBuild from './core/interface/general/ci-build.interface';
import ICommit from './core/interface/general/commit.interface';
import IPullRequest from './core/interface/general/pull-request.interface';
import IGithubUser from './core/interface/repository/github/github-user.interface';
import BuildPipelineCard from './features/azure-devops/build-pipeline-card/build-pipeline-card';
import CommitCard from './features/github/commit-card/commit-card';
import PullRequestCard from './features/github/pull-request-card/pull-request-card';
import Store from './store';

@Component({
    computed: {
        ...mapGetters(Store.azureDevopsStoreName, {
            _ciBuilds: 'getCiBuilds'
        }),
        ...mapGetters(Store.githubStoreName, {
            _commits: 'getCommits',
            _pullRequests: 'getPullRequests'
        })
    }
})
export default class App extends tsx.Component<any> {
    @Ref('cards') private _cards: any;
    private _ciBuilds!: ICiBuild[];
    private _commits!: ICommit<IGithubUser>[];
    private _pullRequests!: IPullRequest<IGithubUser>[];

    private getCard(props: any): any {
        const { type, id } = props.item.data;

        switch(type) {
            case 'ci-build':
                return this.getCiBuildCard(id, props.close);
            case 'commit':
                return this.getCommitCard(id, props.close);
            case 'pull-request':
                return this.getPullRequestCard(id, props.close);
            default:
                return null;
        }
    }

    private getCiBuildCard(id: string, closeHandler: any): any {
        const identifier = `ci_card_${id}`;
        const build = this._ciBuilds.find(_ => _.id === id);
        const updated = this.updateCard(id);

        if (updated) {
            this.applyUpdateEffect(identifier);
        }
        return (updated || !build) ? null : (
            <div class="notification-wrapper">
                {this.getCloseButton(closeHandler)}
                <BuildPipelineCard class={identifier} build={build} />
            </div>
        );
    }

    private getCommitCard(id: string, closeHandler: any): any {
        const commit = this._commits.find(_ => _.id === id);

        return !commit ? null : (
            <div class="notification-wrapper">
                {this.getCloseButton(closeHandler)}
                <CommitCard commit={commit} />
            </div>
        );
    }

    private getPullRequestCard(id: string, closeHandler: any): any {
        const identifier = `pr_card_${id}`;
        const pullRequest = this._pullRequests.find(_ => _.id === id);
        const updated = this.updateCard(id);

        if (updated) {
            this.applyUpdateEffect(identifier);
        }
        return (updated || !pullRequest) ? null : (
            <div class="notification-wrapper">
                {this.getCloseButton(closeHandler)}
                <PullRequestCard class={identifier} pullRequest={pullRequest} />
            </div>
        );
    }

    private getCloseButton(closeHandler: any): any {
        return <i class="fas fa-times-circle close" onClick={closeHandler}></i>;
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

    private applyUpdateEffect(id: string): void {
        const elements = document.getElementsByClassName(id);

        Array.prototype.forEach.call(elements, _ => {
            _.classList.remove('updated-card');
            setTimeout(() => _.classList.add('updated-card'));
        });
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
