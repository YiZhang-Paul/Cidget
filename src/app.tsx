import { Component } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { mapGetters } from 'vuex';

import Store from './store';
import ICommit from './core/interface/general/commit.interface';
import IGithubUser from './core/interface/repository/github/github-user.interface';
import CommitCard from './features/github/commit-card/commit-card';

@Component({
    computed: {
        ...mapGetters(Store.githubStoreName, {
            commits: 'getCommits'
        })
    }
})
export default class App extends tsx.Component<any> {
    private commits!: ICommit<IGithubUser>[];

    public render(): any {
        const commits = this.commits.map(_ => {
            return <CommitCard class="commit-card" key={_.time.getTime()} commit={_} />;
        });

        return (
            <div>{commits}</div>
        );
    }
}
