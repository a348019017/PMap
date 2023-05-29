export default class EventManager {
    constructor(viewer: any);
    /**
     * 记录是否按下左键
     * @type {boolean}
     */
    press: boolean;
    /**
     *
     * @type {null}
     */
    handler: null;
    listener: null;
    evtDict: null;
    addEventListener(eventType: any, func: any): void;
    removeEventListener(eventType: any): void;
}
//# sourceMappingURL=EventManager.d.ts.map