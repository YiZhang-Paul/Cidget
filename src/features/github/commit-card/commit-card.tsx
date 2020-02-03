import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

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

    private toPullRequestCreation(): void {
        shell.openExternal(`${this.commit.repository.url}/compare/${this.commit.branch}`);
    }

    public render(): any {
        return (
            <NotificationCard logoUrl={require('../../../../public/images/github-logo.png')}>
                <div class="commit-content-container">
                    <div class="commit-message-container">
                        <WeblinkDisplay class="commit-message"
                            text={this.commit.message}
                            url={this.commit.commitUrl}>
                        </WeblinkDisplay>

                        <ChangeStatsSummary class="change-summary"
                            added={this.added}
                            removed={this.removed}
                            modified={this.modified}>
                        </ChangeStatsSummary>
                    </div>

                    <div class="commit-info-container">
                        <BranchBadge class="branch-badge"
                            name={this.commit.branch}
                            url={this.branchUrl}>
                        </BranchBadge>

                        <i class="fas fa-arrow-alt-circle-right right-arrow"></i>

                        <RepositoryBadge class="repository-name"
                            repository={this.commit.repository}
                            showPopover={false}
                            noTooltip={true}>
                        </RepositoryBadge>

                        <RelativeTimeDisplay class="time" time={this.commit.time} />
                    </div>
                </div>

                <div class="commit-card-actions" slot="actions">
                    <div class="open-pull-request">
                        <div class="open-pull-request-icon" onClick={this.toPullRequestCreation}></div>
                    </div>

                    <div class="open-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            </NotificationCard>
        );
    }
}
