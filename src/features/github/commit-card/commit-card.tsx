import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import ICommit from '../../../core/interface/general/commit.interface';
import IRepository from '../../../core/interface/repository/repository.interface';
import UserInfoCard from '../user-info-card/user-info-card';
import RepositoryInfoCard from '../repository-info-card/repository-info-card';

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

    private get localeCommitTime(): string {
        return this.commit.time.toLocaleString();
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
            <el-popover placement="bottom-start" width="150" trigger="hover">
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
            <div>
                <a class="message" onClick={this.toCommit}>{this.commit.message}</a>
                <span> <i class="el-icon-caret-top add"></i>{this.added}</span>
                <span> <i class="el-icon-caret-bottom remove"></i>{this.removed}</span>
                <span> <i class="el-icon-d-caret modify"></i>{this.modified}</span>
            </div>
        );

        const commitInfo = (
            <div>
                <a class="name" onClick={this.toProfile}>{this.commit.initiator.name}</a>
                <span> pushed to </span>
                <a class="branch" onClick={this.toBranch}>
                    <i class="fas fa-code-branch"></i>{this.commit.branch}
                </a>

                <el-popover placement="bottom" width="100" trigger="hover">
                    <RepositoryInfoCard repository={this.commit.repository} />
                    <a class="name" onClick={this.toRepository} slot="reference">
                        {` @${this.commit.repository.name}`}
                    </a>
                </el-popover>

                <el-tooltip placement="right" effect="light" content={this.localeCommitTime}>
                    <span> {this.relativeCommitTime}</span>
                </el-tooltip>
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
