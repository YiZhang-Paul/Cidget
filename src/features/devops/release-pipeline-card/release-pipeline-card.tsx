import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import ICdRelease from '../../../core/interface/devops/cd/cd-release.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import StepSummary from '../../../shared/components/generic/step-summary/step-summary';

import './release-pipeline-card.scss';

@Component
export default class ReleasePipelineCard extends tsx.Component<any> {
    @Prop() public release!: ICdRelease;
    @Prop() public logoUrl!: string;
    @Prop() public closeHandler!: () => void;

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

    private get statusText(): string {
        const words = this.release.status.split(' ');
        const capitalized = words.map(_ => `${_[0].toUpperCase()}${_.slice(1)}`);

        return capitalized.join(' ').replace(/^Is\s/, 'is ');
    }

    private get blinkModeOn(): boolean {
        if (['abandoned', 'rejected', 'canceled'].includes(this.release.status)) {
            return false;
        }
        return this.stages.slice(-1)[0]?.status !== 'succeeded';
    }

    public render(): any {
        const className = `release-name ${this.release.status === 'abandoned' ? 'abandoned' : ''}`;

        return (
            <NotificationCard time={this.release.createdOn} closeHandler={this.closeHandler} logoUrl={this.logoUrl}>
                <div class="release-pipeline-message-container">
                    <WeblinkDisplay class={className}
                        text={`${this.release.name} ${this.release.pipeline.name}`}
                        url={this.release.url}>
                    </WeblinkDisplay>

                    <div class="status-text">{this.statusText}</div>

                    <StepSummary class="stages-summary"
                        steps={this.stages}
                        blinkMode={this.blinkModeOn}>
                    </StepSummary>
                </div>

                <div class="release-pipeline-info-container">
                    <div class="trigger-text">Triggered By</div>

                    <WeblinkDisplay class="trigger-name"
                        text={this.release.triggeredBy.name}
                        url={this.release.triggeredBy.url}>
                    </WeblinkDisplay>
                </div>
            </NotificationCard>
        );
    }
}
