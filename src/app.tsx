import { Component, Ref } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { mapGetters } from 'vuex';

import Store from './store';
import ICiBuild from './core/interface/general/ci-build.interface';
import ICdRelease from './core/interface/general/cd-release.interface';
import ICommit from './core/interface/general/commit.interface';
import IPullRequest from './core/interface/general/pull-request.interface';
import IGithubUser from './core/interface/repository/github/github-user.interface';
import BuildPipelineCard from './features/azure-devops/build-pipeline-card/build-pipeline-card';
import ReleasePipelineCard from './features/azure-devops/release-pipeline-card/release-pipeline-card';
import CommitCard from './features/github/commit-card/commit-card';
import PullRequestCard from './features/github/pull-request-card/pull-request-card';

@Component({
    computed: {
        ...mapGetters(Store.azureDevopsStoreName, {
            _ciBuilds: 'getCiBuilds',
            _cdReleases: 'getCdReleases'
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
    private _cdReleases!: ICdRelease[];
    private _commits!: ICommit<IGithubUser>[];
    private _pullRequests!: IPullRequest<IGithubUser>[];

    private getNotificationCard(props: any): any {
        const { type, id } = props.item.data;
        const identifier = `${type}_card_${id}`;
        const close = <i class="fas fa-times-circle close" onClick={props.close}></i>;

        if (this.updateCard(id)) {
            this.applyEffect(identifier);

            return null;
        }
        const card = this.getEventCard(type, id, identifier);

        return card ? <div class="notification-wrapper">{close}{card}</div> : null;
    }

    private getEventCard(type: string, id: string, className: string): any {
        let data: any = null;

        switch (type) {
            case 'ci-build':
                data = this._ciBuilds.find(_ => _.id === id);
                return data ? <BuildPipelineCard class={className} build={data} /> : null;
            case 'cd-release':
                data = this._cdReleases.find(_ => _.id === id);
                return data ? <ReleasePipelineCard class={className} release={data} /> : null;
            case 'commit':
                data = this._commits.find(_ => _.id === id);
                return data ? <CommitCard class={className} commit={data} /> : null;
            case 'pull-request':
                data = this._pullRequests.find(_ => _.id === id);
                return data ? <PullRequestCard class={className} pullRequest={data} /> : null;
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
                width={640}
                scopedSlots={{ body: this.getNotificationCard }}>
            </notifications>
        );
    }
}
