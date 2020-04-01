import Vue from 'vue';

import INotificationOption from '../../../interface/generic/notification-option.interface';

export default class NotificationHandler {
    private _events = new Map<string, INotificationOption>();

    public push(name: string, data: any, duration = 2000): void {
        if (!this._events.has(name)) {
            this._events.set(name, { locked: false, data });
        }
        const event = this._events.get(name);

        if (!event) {
            return;
        }

        if (event.locked) {
            event.data = data;
        }
        else {
            this.sendNotification(name, event, duration);
        }
    }

    private sendNotification(name: string, event: INotificationOption, duration: number): void {
        event.locked = true;
        Vue.notify(event.data);
        event.data = null;

        setTimeout(() => {
            event.locked = false;

            if (event.data) {
                this.push(name, event.data, duration);
            }
        }, duration);
    }
}
