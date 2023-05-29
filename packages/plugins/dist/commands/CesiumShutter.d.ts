/**
 * Cesium卷帘封装类，除UI外封装一些内部功能,仅仅仅只包含左右的卷帘
 */
export class CesiumShutter {
    /**
     * 构建一个卷帘类，处理上下卷帘和左右卷帘的操作，包含一点UI动作，用于Vue Shutter中使用
     * @param {*} divOrName  卷帘中心分隔线的element id
     * @param {*} option
     */
    constructor(divOrName: any, option: any);
    _silder: HTMLElement | null;
    active(): void;
    _handler: any;
    deactive(): void;
    destroy(): void;
}
//# sourceMappingURL=CesiumShutter.d.ts.map