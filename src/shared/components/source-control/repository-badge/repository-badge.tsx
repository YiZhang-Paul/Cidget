import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import IRepository from '../../../../core/interface/source-control/repository.interface';
import WeblinkDisplay from '../../generic/weblink-display/weblink-display';

import './repository-badge.scss';

@Component
export default class RepositoryBadge extends tsx.Component<any> {
    @Prop() public repository!: IRepository;
    @Prop({ default: true }) public noTooltip!: boolean;

    public render(): any {
        return (
            <WeblinkDisplay class="repository-badge-container"
                text={this.repository.name}
                url={this.repository.url}
                borderless={true}
                noTooltip={this.noTooltip}>
            </WeblinkDisplay>
        );
    }
}
