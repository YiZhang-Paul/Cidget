import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICdRelease from '../../../core/interface/general/cd-release.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import StepSummary from '../../../shared/components/generic/step-summary/step-summary';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './release-pipeline-card.scss';

@Component
export default class ReleasePipelineCard extends tsx.Component<any> {
    @Prop() public release!: ICdRelease;

    private get stages(): { name: string; status: string; scale: number; isActive: boolean }[] {
        const scales = new Map<string, number>([
            ['approved', 1],
            ['rejected', 2],
            ['canceled', 2],
            ['pending', 3],
            ['needs approval', 3],
            ['succeeded', 4],
            ['partially succeeded', 5],
            ['failed', 6],
        ]);

        return (this.release.stages ?? []).map(stage => {
            const isActive = this.release.activeStage === stage.name;
            const status = isActive ? this.release.status : stage.status;

            return ({
                name: stage.name,
                status,
                scale: scales.get(status) ?? 0,
                isActive
            });
        });
    }

    private toPipeline(): void {
        shell.openExternal(this.release.pipeline.url);
    }

    public render(): any {
        const className = `release-name ${this.release.status === 'abandoned' ? 'abandoned' : ''}`;
        const blinkModeOn = this.stages.slice(-1)[0]?.status !== 'succeeded';

        return (
            <NotificationCard logoUrl={require('../../../../public/images/azure-devops-logo.png')}>
                <div class="release-pipeline-message-container">
                    <WeblinkDisplay class={className}
                        text={this.release.name}
                        url={this.release.url}>
                    </WeblinkDisplay>

                    <div>
                        <span>from</span>

                        <a class="pipeline-name" onClick={this.toPipeline}>
                            {this.release.pipeline.name}
                        </a>

                        <span>{this.release.status}</span>
                    </div>

                    <StepSummary class="stages-summary" steps={this.stages} blinkMode={blinkModeOn} />
                </div>

                <div class="release-pipeline-info-container">
                    <span>Triggered by </span>

                    <WeblinkDisplay class="trigger-name"
                        text={this.release.triggeredBy.name}
                        url={this.release.triggeredBy.url}>
                    </WeblinkDisplay>

                    <span class="project-name">@{this.release.project}</span>
                    <RelativeTimeDisplay time={this.release.createdOn} />
                </div>
            </NotificationCard>
        );
    }
}
