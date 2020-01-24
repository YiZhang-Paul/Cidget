import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import ICdRelease from '../../../core/interface/general/cd-release.interface';
import NotificationCard from '../../../shared/components/generic/notification-card/notification-card';
import WeblinkDisplay from '../../../shared/components/generic/weblink-display/weblink-display';
import RelativeTimeDisplay from '../../../shared/components/generic/relative-time-display/relative-time-display';

import './release-pipeline-card.scss';

@Component
export default class ReleasePipelineCard extends tsx.Component<any> {
    @Prop() public release!: ICdRelease;

    private toPipeline(): void {
        shell.openExternal(this.release.pipeline.url);
    }

    public render(): any {
        return (
            <NotificationCard logoUrl={require('../../../../public/images/azure-devops-logo.png')}>
                <div class="release-pipeline-message-container">
                    <WeblinkDisplay class="release-name"
                        text={this.release.name}
                        url={this.release.url}>
                    </WeblinkDisplay>

                    <div>
                        <span> from </span>
                        {/* // TODO: status wording */}
                        <a class="pipeline-name" onClick={this.toPipeline}>
                            {this.release.pipeline.name}
                        </a>
                        {/* // TODO: stages summary */}
                        <span> {this.release.status}</span>
                        {/* // TODO: elapsed time */}
                    </div>
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
