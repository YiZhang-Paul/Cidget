import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import ICommit from '../../../core/interface/general/commit.interface';
import IRepository from '../../../core/interface/repository/repository.interface';
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

    private toBranch(): void {
        shell.openExternal(`${this.commit.repository.url}/tree/${this.commit.branch}`);
    }

    private toRepository(): void {
        shell.openExternal(this.commit.repository.url);
    }

    public render(): any {
        const avatar = (
            <el-popover disabled={true} placement="bottom-start" width="150" trigger="hover">
                <UserInfoCard initiator={this.commit.initiator} />
                <el-avatar class="avatar"
                    shape="square"
                    size={50}
                    src={this.commit.initiator.avatar}
                    slot="reference">
                </el-avatar>
            </el-popover>
        );

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
                <div class="changes-container">
                    <span> <i class="el-icon-caret-top add"></i>{this.added}</span>
                    <span> <i class="el-icon-caret-bottom remove"></i>{this.removed}</span>
                    <span> <i class="el-icon-d-caret modify"></i>{this.modified}</span>
                </div>
            </div>
        );

        const commitInfo = (
            <div class="commit-info">
                <div>
                    <a class="name" onClick={this.toProfile}>{this.commit.initiator.name}</a>
                    <span> pushed to </span>
                </div>

                <div class="branch-container">
                    <a class="branch" onClick={this.toBranch}>
                        <i class="fas fa-code-branch"></i>{this.commit.branch}
                    </a>
                </div>

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

        return (
            <div class="commit-card-container">
                {avatar}
                <div class="content">
                    {commitMessage}
                    {commitInfo}
                </div>
            </div>
        );
    }
}
