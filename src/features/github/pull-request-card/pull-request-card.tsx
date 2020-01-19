import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IGithubUser from '../../../core/interface/repository/github/github-user.interface';
import IPullRequest from '../../../core/interface/general/pull-request.interface';
import UserAvatar from '../../../shared/components/generic/user-avatar/user-avatar';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';
import UserInfoCard from '../user-info-card/user-info-card';

import './pull-request-card.scss';

@Component
export default class PullRequestCard extends tsx.Component<any> {
    @Prop() public pullRequest!: IPullRequest<IGithubUser>;

    private get sourceBranchUrl(): string {
        return `${this.pullRequest.repository.url}/tree/${this.pullRequest.branch.source}`;
    }

    private get baseBranchUrl(): string {
        return `${this.pullRequest.repository.url}/tree/${this.pullRequest.branch.base}`;
    }

    private toProfile(): void {
        shell.openExternal(this.pullRequest.initiator.profileUrl);
    }

    public render(): any {
        const [pullRequest, initiator] = [this.pullRequest, this.pullRequest.initiator];
        let mergeIcon = 'el-icon-refresh';

        if (pullRequest.mergeable !== null) {
            mergeIcon = pullRequest.mergeable ? 'el-icon-check' : 'el-icon-close';
        }

        return (
            <div class="pull-request-card-container">
                <UserAvatar class="user-avatar" url={initiator.avatar} showPopover={false}>
                    <UserInfoCard initiator={initiator} />
                </UserAvatar>

                <div class="content">
                    <div class="pull-request-message-container">
                        <div>
                            <a class="name" onClick={this.toProfile}>{initiator.name}</a>
                            <span> {pullRequest.action} </span>
                        </div>

                        <WeblinkDisplay class="message"
                            text={`PR#${pullRequest.number} ${pullRequest.message}`}
                            url={pullRequest.pullRequestUrl}>
                        </WeblinkDisplay>

                        <i class={mergeIcon}></i>

                        <ChangeStatsSummary class="change-summary"
                            added={pullRequest.added}
                            removed={pullRequest.removed}
                            modified={pullRequest.modified}>
                        </ChangeStatsSummary>
                    </div>

                    <div class="pull-request-info-container">
                        <BranchBadge class="branch-badge"
                            name={pullRequest.branch.source}
                            url={this.sourceBranchUrl}>
                        </BranchBadge>

                        <i class="el-icon-right"></i>

                        <BranchBadge class="branch-badge"
                            name={pullRequest.branch.base}
                            url={this.baseBranchUrl}>
                        </BranchBadge>

                        <RepositoryBadge repository={pullRequest.repository} showPopover={false} />
                        <RelativeTimeDisplay time={pullRequest.updatedOn} />
                    </div>
                </div>
            </div>
        );
    }
}
