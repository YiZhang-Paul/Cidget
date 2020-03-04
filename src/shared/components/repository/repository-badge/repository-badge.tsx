import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import IRepository from '../../../../core/interface/source-control/repository.interface';
import RepositoryInfoCard from '../repository-info-card/repository-info-card';
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
            <el-popover class="repository-badge-container"
                disabled={!this.showPopover}
                width={this.popoverWidth}
                placement={this.popoverPosition}
                trigger="hover">

                <RepositoryInfoCard repository={this.repository} />
                <WeblinkDisplay class="repository-name"
                    text={this.repository.name}
                    url={this.repository.url}
                    borderless={true}
                    noTooltip={this.noTooltip}
                    slot="reference">
                </WeblinkDisplay>

            </el-popover>
        );
    }
}
