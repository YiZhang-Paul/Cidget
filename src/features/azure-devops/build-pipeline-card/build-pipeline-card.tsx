import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICiBuild from '../../../core/interface/general/ci-build.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './build-pipeline-card.scss';

@Component
export default class BuildPipelineCard extends tsx.Component<any> {
    @Prop() public build!: ICiBuild;

    private get status(): string {
        const status = this.build.result || `is ${this.build.status}`;

        return status.replace('inProgress', 'running');
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

    private toPipeline(): void {
        shell.openExternal(this.build.pipeline.url);
    }

    public render(): any {
        const { triggeredBy } = this.build;
        const timeClass = `elapsed-time ${this.isSlowBuild ? 'slow-build' : 'fast-build'}`;
        const elapsedTime = <span class={timeClass}> [{this.elapsedTime}]</span>;

        return (
            <NotificationCard logoUrl={require('../../../../public/images/azure-devops-logo.png')}>
                <div class="build-pipeline-message-container">
                    <WeblinkDisplay class={`build-name ${this.status}`}
                        text={this.build.name}
                        tooltip={this.build.message}
                        url={this.build.url}>
                    </WeblinkDisplay>

                    <div>
                        <span> from </span>
                        <a class="pipeline-name" onClick={this.toPipeline}>
                            {this.build.pipeline.name}
                        </a>
                        <span> {this.status}</span>
                        { this.build.result ? elapsedTime : '' }
                    </div>
                </div>

                <div class="build-pipeline-info-container">
                    <span>Triggered by</span>

                    <BranchBadge class="branch-badge"
                        disabled={triggeredBy.branch.isPullRequest}
                        name={triggeredBy.branch.isPullRequest ? 'AUTO' : triggeredBy.branch.name}
                        url={triggeredBy.branch.url}>
                    </BranchBadge>

                    <RepositoryBadge repository={triggeredBy} showPopover={false} />
                    <RelativeTimeDisplay time={this.timestamp} />
                </div>
            </NotificationCard>
        );
    }
}