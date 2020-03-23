import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import './user-avatar.scss';

@Component
export default class UserAvatar extends tsx.Component<any> {
    @Prop() public url!: string;
    @Prop({ default: 80 }) public size!: number;

    public render(): any {
        const wrapperStyle = { width: `${this.size}px`, height: `${this.size}px` };
        const avatarStyle = { 'background-image': `url('${this.url}')` };

        return (
            <div class="user-avatar-container" style={wrapperStyle} slot="reference">
                <div class="avatar-overlay"></div>
                <div class="avatar" style={avatarStyle}></div>
            </div>
        );
    }
}
