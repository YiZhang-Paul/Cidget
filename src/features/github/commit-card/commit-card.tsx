import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICommit from '../../../core/interface/general/commit.interface';
import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import IRepository from '../../../core/interface/repository/repository.interface';
import UserAvatar from '../../../shared/components/generic/user-avatar/user-avatar';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';
import UserInfoCard from '../user-info-card/user-info-card';

import './commit-card.scss';

@Component
export default class CommitCard extends tsx.Component<any> {
    @Prop() public commit!: ICommit<IGithubUser, IRepository>;

    private get showMessageTooltip(): boolean {
        return this.commit.message.length >= 50;
    }

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

    private toCommit(): void {
        shell.openExternal(this.commit.commitUrl);
    }

    public render(): any {
        const commitMessage = (
            <div class="commit-message">
                <div class="message-container">
                    <el-tooltip disabled={!this.showMessageTooltip}
                        placement="top-start"
                        effect="light"
                        content={this.commit.message}>
                        <a class="message" onClick={this.toCommit}>{this.commit.message}</a>
                    </el-tooltip>
                </div>
                <ChangeStatsSummary class="change-summary"
                    added={this.added}
                    removed={this.removed}
                    modified={this.modified}>
                </ChangeStatsSummary>
            </div>
        );

        const commitInfo = (
            <div class="commit-info">
                <div>
                    <a class="name" onClick={this.toProfile}>{this.commit.initiator.name}</a>
                    <span> pushed to </span>
                </div>

                <BranchBadge class="branch-badge" name={this.commit.branch} url={this.branchUrl} />
                <RepositoryBadge class="repository-badge" repository={this.commit.repository} showPopover={false} />
                <RelativeTimeDisplay class="relative-time-display" time={this.commit.time} />
            </div>
        );

        const initiator = this.commit.initiator;

        return (
            <div class="commit-card-container">

                <UserAvatar class="user-avatar" url={initiator.avatar} showPopover={false}>
                    <UserInfoCard initiator={initiator} />
                </UserAvatar>

                <div class="content">
                    {commitMessage}
                    {commitInfo}
                </div>
            </div>
        );
    }
}
