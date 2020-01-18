import { Component } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { mapGetters } from 'vuex';

import ICommit from './core/interface/general/commit.interface';
import IGithubUser from './core/interface/repository/github/github-user.interface';
import CommitCard from './features/github/commit-card/commit-card';
import Store from './store';

@Component({
    computed: {
        ...mapGetters(Store.githubStoreName, {
            commits: 'getCommits'
        })
    }
})
export default class App extends tsx.Component<any> {
    private commits!: ICommit<IGithubUser>[];

    private getCommitCard(id: string): any {
        const commit = this.commits.find(_ => _.id === id) ?? null;

        return commit ? <CommitCard commit={commit} /> : null;
    }

    public render(): any {
        return (
            <notifications class="notification"
                group="notification"
                position="top left"
                width={550}
                scopedSlots={{ body: (_: any) => this.getCommitCard(_.item.text) }}>
            </notifications>
        );
    }
}
