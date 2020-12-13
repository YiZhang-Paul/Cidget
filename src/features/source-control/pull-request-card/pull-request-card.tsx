import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import IPullRequest from '../../../core/interface/source-control/pull-request/pull-request.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import ChangeStatsSummary from '../../../shared/components/generic/change-stats-summary/change-stats-summary';
import BranchBadge from '../../../shared/components/source-control/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/source-control/repository-badge/repository-badge';

import './pull-request-card.scss';

@Component
export default class PullRequestCard extends tsx.Component<any> {
    @Prop() public pullRequest!: IPullRequest;
    @Prop() public logoUrl!: string;
    @Prop() public closeHandler!: () => void;

    private get action(): string {
        const words = this.pullRequest.action.split(' ');

        return words.map(_ => `${_[0].toUpperCase()}${_.slice(1)}`).join(' ');
    }

    private get sourceBranchUrl(): string {
        return `${this.pullRequest.repository.url}/tree/${this.pullRequest.branch.source}`;
    }

    private get baseBranchUrl(): string {
        return `${this.pullRequest.repository.url}/tree/${this.pullRequest.branch.base}`;
    }

    private get reviewerSummary(): string {
        const { requested, approved } = this.pullRequest.reviewers;

        return `[${approved.length}/${requested.length}]`;
    }

    public render(): any {
        const actionClass = this.action === 'Rejected' ? 'rejected' : '';
        let statusClass = 'pending';

        if (this.pullRequest.mergeable !== null) {
            statusClass = this.pullRequest.mergeable ? 'mergeable' : 'not-mergeable';
        }

        return (
            <NotificationCard time={this.pullRequest.updatedOn} closeHandler={this.closeHandler} logoUrl={this.logoUrl}>
                <div class="pull-request-message-container">
                    <div class="pull-request-message-wrapper">
                        <div onClick={this.closeHandler}>
                            <WeblinkDisplay class="pull-request-message"
                                text={`PR #${this.pullRequest.number}`}
                                url={this.pullRequest.pullRequestUrl}>
                            </WeblinkDisplay>
                        </div>

                        <div class={`check-status ${statusClass}`}></div>
                    </div>

                    <div class={`pull-request-action ${actionClass}`}>{this.action}</div>

                    <div class="reviewers-summary">
                        <i class="fas fa-user-check reviewers-icon"></i>
                        {this.reviewerSummary}
                    </div>

                    <ChangeStatsSummary class="change-summary"
                        added={this.pullRequest.added}
                        removed={this.pullRequest.removed}
                        modified={this.pullRequest.modified}>
                    </ChangeStatsSummary>
                </div>

                <div class="pull-request-info-container">
                    <BranchBadge class="from-branch-badge"
                        name={this.pullRequest.branch.source}
                        url={this.sourceBranchUrl}>
                    </BranchBadge>

                    <div class="merge-icon"></div>

                    <BranchBadge class="to-branch-badge"
                        name={this.pullRequest.branch.base}
                        url={this.baseBranchUrl}>
                    </BranchBadge>

                    <i class="fas fa-arrow-alt-circle-right right-arrow"></i>

                    <RepositoryBadge class="repository-name"
                        repository={this.pullRequest.repository}
                        showPopover={false}>
                    </RepositoryBadge>
                </div>
            </NotificationCard>
        );
    }
}
