import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import ICiBuild from '../../../core/interface/pipeline/ci-build.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';

import './build-pipeline-card.scss';

@Component
export default class BuildPipelineCard extends tsx.Component<any> {
    @Prop() public build!: ICiBuild;
    @Prop() public closeHandler!: () => void;

    private get status(): string {
        const status = this.build.result || `is ${this.build.status}`;

        return status.replace('inProgress', 'running');
    }

    private get statusText(): string {
        const words = this.status.split(' ');
        const capitalized = words.map(_ => `${_[0].toUpperCase()}${_.slice(1)}`);

        return capitalized.join(' ').replace(/^Is\s/, 'is ');
    }

    private get elapsedSeconds(): number {
        const start = this.build.startedOn;
        const end = this.build.finishedOn || new Date();

        return Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    private get isSlowBuild(): boolean {
        return this.elapsedSeconds >= 300;
    }

    private get elapsedTime(): string {
        const elapsed = this.elapsedSeconds;
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor(elapsed % 3600 / 60);
        const seconds = elapsed % 3600 % 60;

        return [[hours, 'h'], [minutes, 'm'], [seconds, 's']]
            .filter(_ => _[0])
            .map(_ => _.join(''))
            .join(' ');
    }

    private get timestamp(): Date {
        return this.build.finishedOn || this.build.startedOn;
    }

    private get branchName(): string {
        const branch = this.build.triggeredBy.branch;

        return branch.isPullRequest ? 'AUTO' : branch.name;
    }

    public render(): any {
        const { triggeredBy } = this.build;
        const timeClass = `elapsed-time ${this.isSlowBuild ? 'slow-build' : 'fast-build'}`;
        const elapsedTime = <div class={timeClass}> [{this.elapsedTime}]</div>;

        return (
            <NotificationCard time={this.timestamp}
                closeHandler={this.closeHandler}
                logoUrl={require('../../../../public/images/azure-devops-logo.png')}>

                <div class="build-pipeline-message-container">
                    <div class="build-pipeline-message-wrapper">
                        <WeblinkDisplay class="build-name"
                            text={`${this.build.name} ${this.build.pipeline.name}`}
                            url={this.build.url}>
                        </WeblinkDisplay>
                        <div class={`check-status ${this.status}`}></div>
                    </div>

                    <div class="status-text">{this.statusText}</div>
                    { this.build.result ? elapsedTime : '' }
                </div>

                <div class="build-pipeline-info-container">
                    <BranchBadge class="branch-badge"
                        disabled={triggeredBy.branch.isPullRequest}
                        name={this.branchName}
                        url={triggeredBy.branch.url}>
                    </BranchBadge>

                    <i class="fas fa-arrow-alt-circle-right right-arrow"></i>

                    <RepositoryBadge class="repository-name"
                        repository={triggeredBy}
                        showPopover={false}>
                    </RepositoryBadge>
                </div>

                <div class="build-pipeline-card-actions" slot="actions">
                    <div class="open-options">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            </NotificationCard>
        );
    }
}
