//Cesium卷帘封装类，除UI外封装一些内部功能
export class CesiumShutter {

    /**
     * 构建一个卷帘类，处理上下卷帘和左右卷帘的操作，包含一点UI动作，用于Vue Shutter中使用
     * @param {*} divOrName 
     * @param {*} option 
     */
    constructor(divOrName,option){
        const slider = document.getElementById(divOrName);
        this._silder=slider;
    }

    active() {
        this.deactive();
        let slider=this._silder;
        const handler = new Cesium.ScreenSpaceEventHandler(slider);
        this._handler=handler;
        let moveActive = false;

        function move(movement) {
            if (!moveActive) {
                return;
            }

            const relativeOffset = movement.endPosition.x;
            const splitPosition =
                (slider.offsetLeft + relativeOffset) /
                slider.parentElement.offsetWidth;
            slider.style.left = `${100.0 * splitPosition}%`;
            viewer.scene.splitPosition = splitPosition;
        }

        handler.setInputAction(function() {
            moveActive = true;
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        handler.setInputAction(function() {
            moveActive = true;
        }, Cesium.ScreenSpaceEventType.PINCH_START);

        handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE);

        handler.setInputAction(function() {
            moveActive = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(function() {
            moveActive = false;
        }, Cesium.ScreenSpaceEventType.PINCH_END);
    }

    deactive() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = undefined;
        }
    }
}
