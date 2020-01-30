import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import ICommit from '../../../core/interface/general/commit.interface';
import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './commit-card.scss';

@Component
export default class CommitCard extends tsx.Component<any> {
    @Prop() public commit!: ICommit<IGithubUser>;

    private get added(): number {
        return (this.commit.added ?? []).length;
    }

    private get removed(): number {
        return (this.commit.removed ?? []).length;
    }

    private get modified(): number {
        return (this.commit.modified ?? []).length;
    }

    private get branchUrl(): string {
        return `${this.commit.repository.url}/tree/${this.commit.branch}`;
    }

    public render(): any {
        const [commit, initiator] = [this.commit, this.commit.initiator];

        return (
            <NotificationCard logoUrl={require('../../../../public/images/github-logo.png')}>
                <div class="commit-message-container">
                    <WeblinkDisplay class="commit-message"
                        text={commit.message}
                        url={commit.commitUrl}>
                    </WeblinkDisplay>

                    <ChangeStatsSummary class="change-summary"
                        added={this.added}
                        removed={this.removed}
                        modified={this.modified}>
                    </ChangeStatsSummary>
                </div>

                <div class="commit-info-container">
                    <WeblinkDisplay class="committer-name"
                        text={initiator.name}
                        url={this.commit.initiator.profileUrl}>
                    </WeblinkDisplay>
                    pushed
                    <BranchBadge class="branch-badge"
                        name={commit.branch}
                        url={this.branchUrl}>
                    </BranchBadge>
                    @
                    <RepositoryBadge class="repository-name"
                        repository={commit.repository}
                        showPopover={false}>
                    </RepositoryBadge>

                    <RelativeTimeDisplay time={commit.time} />
                </div>
            </NotificationCard>
        );
    }
}
