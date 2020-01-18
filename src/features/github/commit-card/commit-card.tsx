import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICommit from '../../../core/interface/general/commit.interface';
import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import IRepository from '../../../core/interface/repository/repository.interface';
import UserAvatar from '../../../shared/components/generic/user-avatar/user-avatar';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';
import UserInfoCard from '../user-info-card/user-info-card';

import './commit-card.scss';

@Component
export default class CommitCard extends tsx.Component<any> {
    @Prop() public commit!: ICommit<IGithubUser, IRepository>;

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

    private toProfile(): void {
        shell.openExternal(this.commit.initiator.profileUrl);
    }

    public render(): any {
        const [commit, initiator] = [this.commit, this.commit.initiator];

        return (
            <div class="commit-card-container">
                 <UserAvatar class="user-avatar" url={initiator.avatar} showPopover={false}>
                    <UserInfoCard initiator={initiator} />
                </UserAvatar>

                <div class="content">
                    <div class="commit-message-container">
                        <WeblinkDisplay text={commit.message} url={commit.commitUrl} />

                        <ChangeStatsSummary class="change-summary"
                            added={this.added}
                            removed={this.removed}
                            modified={this.modified}>
                        </ChangeStatsSummary>
                    </div>

                    <div class="commit-info-container">
                        <div>
                            <a class="name" onClick={this.toProfile}>{initiator.name}</a>
                            <span> pushed to </span>
                        </div>

                        <BranchBadge class="branch-badge"
                            name={commit.branch}
                            url={this.branchUrl}>
                        </BranchBadge>

                        <RepositoryBadge repository={commit.repository} showPopover={false} />
                        <RelativeTimeDisplay time={commit.time} />
                    </div>
                </div>
            </div>
        );
    }
}
