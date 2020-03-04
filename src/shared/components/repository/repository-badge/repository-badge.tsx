import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import IRepository from '../../../../core/interface/source-control/repository.interface';
import WeblinkDisplay from '../../generic/weblink-display/weblink-display';

import './repository-badge.scss';

@Component
export default class RepositoryBadge extends tsx.Component<any> {
    @Prop() public repository!: IRepository;
    @Prop({ default: true }) public noTooltip!: boolean;
    @Prop({ default: true }) public showPopover!: boolean;
    @Prop({ default: 100 }) public popoverWidth!: number;
    @Prop({ default: 'bottom' }) public popoverPosition!: string;

    public render(): any {
        return (
            <WeblinkDisplay class="repository-name"
                text={this.repository.name}
                url={this.repository.url}
                borderless={true}
                noTooltip={this.noTooltip}>
            </WeblinkDisplay>
        );
    }
}
