import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './user-avatar.scss';

@Component
export default class UserAvatar extends tsx.Component<any> {
    @Prop() public url!: string;
    @Prop({ default: 50 }) public size!: number;
    @Prop({ default: false }) public isCircle!: boolean;
    @Prop({ default: 'bottom-start' }) public popoverPosition!: number;
    @Prop({ default: 150 }) public popoverWidth!: number;
    @Prop({ default: true }) public showPopover!: boolean;

    private get shape(): string {
        return this.isCircle ? 'circle' : 'square';
    }

    public render(): any {
        return (
            <el-popover class="user-avatar-container"
                disabled={!this.showPopover}
                placement={this.popoverPosition}
                width={this.popoverWidth}
                trigger="hover">

                {this.$slots.default}
                <el-avatar class="avatar"
                    src={this.url}
                    size={this.size}
                    shape={this.shape}
                    slot="reference">
                </el-avatar>

            </el-popover>
        );
    }
}
