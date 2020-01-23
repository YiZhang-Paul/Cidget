import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICiBuild from '../../../core/interface/general/ci-build.interface';
import UserAvatar from '../../../shared/components/generic/user-avatar/user-avatar';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import BranchBadge from '../../../shared/components/repository/branch-badge/branch-badge';
import RepositoryBadge from '../../../shared/components/repository/repository-badge/repository-badge';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './build-pipeline-card.scss';

@Component
export default class BuildPipelineCard extends tsx.Component<any> {
    @Prop() public build!: ICiBuild;

    private get status(): string {
        return this.build.result || `is ${this.build.status}`;
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
        const timeClass = `elapsed-time ${this.isSlowBuild ? 'slow-build' : 'fast-build'}`;

        return (
            <div class="build-pipeline-card-container">
                <UserAvatar class="service-provider-avatar"
                    url='https://pbs.twimg.com/profile_images/1145617831905681408/XNKktHjN_400x400.png'
                    showPopover={false}>
                </UserAvatar>

                <div class="content">
                    <div class="build-pipeline-message-container">
                        <WeblinkDisplay class={`build-name ${this.status}`}
                            text={this.build.name}
                            url={this.build.url}>
                        </WeblinkDisplay>

                        <div>
                            <span> from </span>
                            <a class="pipeline-name" onClick={this.toPipeline}>
                                {this.build.pipeline.name}
                            </a>
                            <span> {this.status}</span>
                            <span class={timeClass}> [{this.elapsedTime}]</span>
                        </div>
                    </div>

                    <div class="build-pipeline-info-container">
                        <span>Triggered by</span>
                        {/* // TODO: include branch information */}
                        <BranchBadge class="branch-badge"
                            name={this.build.repository.branch}
                            url={'https://www.google.com'}>
                        </BranchBadge>
                        {/* // TODO: include repository information */}
                        <RepositoryBadge repository={this.build.repository} showPopover={false} />
                        <RelativeTimeDisplay time={this.timestamp} />
                    </div>
                </div>
            </div>
        );
    }
}
