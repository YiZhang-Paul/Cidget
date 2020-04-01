import Vue from 'vue';
import { injectable } from 'inversify';

import INotificationOption from '../../../interface/generic/notification-option.interface';

@injectable()
export default class NotificationHandler {
    private _counter = 0;
    private _events = new Map<string, INotificationOption>();

    public push(name: string, payload: any, duration = 2500): void {
        if (!this._events.has(name)) {
            this._events.set(name, { locked: false, payload });
        }
        const event = this._events.get(name);

        if (!event) {
            return;
        }
        event.payload = payload;

        if (!event.locked) {
            this.sendNotification(name, event, duration);
        }
    }

    private sendNotification(name: string, event: INotificationOption, duration: number): void {
        event.locked = true;
        event.payload.data.counter = this._counter++;
        Vue.notify(Object.assign({}, event.payload));
        event.payload = null;

        setTimeout(() => {
            event.locked = false;

            if (event.payload) {
                this.push(name, event.payload, duration);
            }
        }, duration);
    }
}
