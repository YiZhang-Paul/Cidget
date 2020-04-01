import Vue from 'vue';
import { injectable } from 'inversify';

import INotificationOption from '../../../interface/generic/notification-option.interface';

@injectable()
export default class NotificationHandler {
    private _events = new Map<string, INotificationOption>();

    public push(name: string, data: any, duration = 4000): void {
        if (!this._events.has(name)) {
            this._events.set(name, { locked: false, data });
        }
        const event = this._events.get(name);

        if (!event) {
            return;
        }
        event.data = data;

        if (!event.locked) {
            this.sendNotification(name, event, duration);
        }
    }

    private sendNotification(name: string, event: INotificationOption, duration: number): void {
        event.locked = true;
        Vue.notify(Object.assign({}, event.data));
        event.data = null;

        setTimeout(() => {
            event.locked = false;

            if (event.data) {
                this.push(name, event.data, duration);
            }
        }, duration);
    }
}
