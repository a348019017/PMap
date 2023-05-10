import EventConstant from "../constant/EventConstant";

export default class EventManager {
    /**
     * 记录是否按下左键
     * @type {boolean}
     */
    press = false;
    /**
     *
     * @type {null}
     */
    handler = null
    listener = null
    evtDict = null

    constructor(viewer) {
        this.press = false
        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        this.evtDict = {}
    }

    addEventListener(eventType, func) {
        let listener = (e) => {
            if (eventType === EventConstant.LEFT_DOWN) this.press = true
            let evt = {message: e}
            return func(evt)
        }
        this.handler.setInputAction(listener, eventType)
        this.evtDict[eventType] = listener

    }

    removeEventListener(eventType) {
        if (eventType === EventConstant.MOUSE_MOVE) this.press = false
        this.handler.removeInputAction(eventType, this.evtDict[eventType])
        this.evtDict = {};
        this.handler.destroy();
    }
}
