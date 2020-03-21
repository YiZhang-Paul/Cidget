import { Component, Prop } from 'vue-property-decorator';
import * as tsx from 'vue-tsx-support';

import UserAvatar from '../../generic/user-avatar/user-avatar';
import RelativeTimeDisplay from '../relative-time-display/relative-time-display';

import './notification-card.scss';

@Component
export default class NotificationCard extends tsx.Component<any> {
    @Prop({ default: '' }) public logoUrl!: string;
    @Prop({ default: false }) public showLogoPopover!: boolean;
    @Prop({ default: () => new Date() }) public time!: Date;
    @Prop() public closeHandler!: () => void;

    public data(): any {
        return ({ closing: false });
    }

    private getClass(name: string): string {
        const type = this.$data.closing ? '-exit' : '-enter';
        console.log(`${name} ${name + type}`);
        return `${name} ${name + type}`;
    }

    private onClose(): void {
        this.$data.closing = true;
        setTimeout(() => this.closeHandler(), 1000);
    }

    public render(): any {
        return (
            <div class={this.getClass('notification-card-container')}>
                <UserAvatar class={this.getClass('service-provider-avatar')}
                    url={this.logoUrl}
                    showPopover={this.showLogoPopover}>
                </UserAvatar>

                <div class={this.getClass('content')}>{this.$slots.default}</div>
                <div class="actions">{this.$slots.actions}</div>

                <RelativeTimeDisplay class={this.getClass('time')} time={this.time} />

                <div class={this.getClass('close-icon')} onClick={this.onClose}>
                    <i class="fas fa-times"></i>
                </div>

                <div class="option-icon">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
        );
    }
}
