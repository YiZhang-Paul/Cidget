import { Component } from 'vue-property-decorator';
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
            commits: 'getCommits',
            pullRequests: 'getPullRequests'
        })
    }
})
export default class App extends tsx.Component<any> {
    private commits!: ICommit<IGithubUser>[];
    private pullRequests!: IPullRequest<IGithubUser>[];

    private getCard(props: any): any {
        const [type, id] = props.item.text.split('|');

        switch(type) {
            case 'commit':
                return this.getCommitCard(id, props.close);
            case 'pull-request':
                return this.getPullRequestCard(id, props.close);
        }

        return null;
    }

    private getCommitCard(id: string, closeHandler: any): any {
        const commit = this.commits.find(_ => _.id === id);
        const close = <i class="fas fa-times-circle close" onClick={closeHandler}></i>
        const commitCard = <CommitCard commit={commit} />;

        return commit ? <div class="notification-wrapper">{close}{commitCard}</div> : null;
    }

    private getPullRequestCard(id: string, closeHandler: any): any {
        const pullRequest = this.pullRequests.find(_ => _.id === id);
        const close = <i class="fas fa-times-circle close" onClick={closeHandler}></i>
        const pullRequestCard = <PullRequestCard pullRequest={pullRequest} />;

        return pullRequest ? <div class="notification-wrapper">{close}{pullRequestCard}</div> : null;
    }

    public render(): any {
        return (
            <notifications class="notification"
                group="notification"
                position="top left"
                width={640}
                scopedSlots={{ body: (_: any) => this.getCard(_) }}>
            </notifications>
        );
    }
}
