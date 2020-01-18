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

    private getCommitCard(props: any): any {
        const commit = this.commits.find(_ => _.id === props.item.text);
        const close = <i class="fas fa-times-circle close" onClick={props.close}></i>
        const commitCard = <CommitCard commit={commit} />;

        return commit ? <div class="notification-wrapper">{close}{commitCard}</div> : null;
    }

    public render(): any {
        return (
            <notifications class="notification"
                group="notification"
                position="top left"
                width={550}
                scopedSlots={{ body: (_: any) => this.getCommitCard(_) }}>
            </notifications>
        );
    }
}
