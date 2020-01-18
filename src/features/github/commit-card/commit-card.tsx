import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import ICommit from '../../../core/interface/general/commit.interface';
import IRepository from '../../../core/interface/repository/repository.interface';
import UserAvatar from '../../../shared/components/generic/user-avatar/user-avatar';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryInfoCard from '../../../shared/components/repository/repository-info-card/repository-info-card';
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

    private get localeCommitTime(): string {
        return this.commit.time.toLocaleTimeString();
    }

    private get relativeCommitTime(): string {
        const checks: [string, number][] = [
            ['year', 60 * 60 * 24 * 365],
            ['month', 60 * 60 * 24 * 30],
            ['day', 60 * 60 * 24],
            ['hour', 60 * 60],
            ['minute', 60]
        ];

        const passed = (Date.now() - this.commit.time.getTime()) / 1000;
        const [unit, threshold] = checks.find(_ => passed >= _[1]) || ['second', 1];
        const total = Math.round(passed / threshold);

        return `${total} ${unit}${total > 1 ? 's' : ''} ago`;
    }

    private toProfile(): void {
        shell.openExternal(this.commit.initiator.profileUrl);
    }

    private toCommit(): void {
        shell.openExternal(this.commit.commitUrl);
    }

    private toRepository(): void {
        shell.openExternal(this.commit.repository.url);
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

                <el-popover disabled={true} placement="bottom" width="100" trigger="hover">
                    <RepositoryInfoCard repository={this.commit.repository} />
                    <a class="name" onClick={this.toRepository} slot="reference">
                        {` @${this.commit.repository.name}`}
                    </a>
                </el-popover>

                <div class="time">
                    <div class="relative-time">{this.relativeCommitTime}</div>
                    <div class="locale-time">{this.localeCommitTime}</div>
                </div>
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
