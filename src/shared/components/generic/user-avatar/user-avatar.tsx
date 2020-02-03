import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './user-avatar.scss';

@Component
export default class UserAvatar extends tsx.Component<any> {
    @Prop() public url!: string;
    @Prop({ default: 70 }) public size!: number;
    @Prop({ default: false }) public isCircle!: boolean;
    @Prop({ default: 'bottom-start' }) public popoverPosition!: number;
    @Prop({ default: 150 }) public popoverWidth!: number;
    @Prop({ default: true }) public showPopover!: boolean;

    public render(): any {
        const wrapperStyle = { width: `${this.size}px`, height: `${this.size}px` };
        const avatarStyle = { 'background-image': `url('${this.url}')` };

        return (
            <el-popover class="user-avatar-container"
                disabled={!this.showPopover}
                placement={this.popoverPosition}
                width={this.popoverWidth}
                trigger="hover">

                {this.$slots.default}
                <div class="avatar-wrapper" style={wrapperStyle} slot="reference">
                    <div class="avatar-overlay"></div>
                    <div class="avatar" style={avatarStyle}></div>
                </div>

            </el-popover>
        );
    }
}
