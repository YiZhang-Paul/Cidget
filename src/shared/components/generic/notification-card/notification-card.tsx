import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import UserAvatar from '../../generic/user-avatar/user-avatar';

import './notification-card.scss';

@Component
export default class NotificationCard extends tsx.Component<any> {
    @Prop({ default: '' }) public logoUrl!: string;
    @Prop({ default: false }) public showLogoPopover!: boolean;

    public render(): any {
        return (
            <div class="notification-card-container">
                <UserAvatar class="service-provider-avatar"
                    url={this.logoUrl}
                    showPopover={this.showLogoPopover}>
                </UserAvatar>

                <div class="content">{this.$slots.default}</div>
            </div>
        );
    }
}
