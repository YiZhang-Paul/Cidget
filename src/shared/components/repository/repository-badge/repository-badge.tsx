import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';
import { shell } from 'electron';

import IRepository from '../../../../core/interface/repository/repository.interface';
import RepositoryInfoCard from '../repository-info-card/repository-info-card';

@Component
export default class RepositoryBadge extends tsx.Component<any> {
    @Prop() public repository!: IRepository;
    @Prop({ default: true }) public showPopover!: boolean;
    @Prop({ default: 100 }) public popoverWidth!: number;
    @Prop({ default: 'bottom' }) public popoverPosition!: string;

    private toRepository(): void {
        shell.openExternal(this.repository.url);
    }

    public render(): any {
        return (
            <el-popover class="repository-badge-container"
                disabled={!this.showPopover}
                width={this.popoverWidth}
                placement={this.popoverPosition}
                trigger="hover">

                <RepositoryInfoCard repository={this.repository} />
                <a class="name" onClick={this.toRepository} slot="reference">
                    {` @${this.repository.name}`}
                </a>

            </el-popover>
        );
    }
}
