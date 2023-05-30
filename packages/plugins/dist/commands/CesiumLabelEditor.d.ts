/**
 * 标注，包含billboard编辑器
 */
export class CesiumLabelEditor {
    /**
     * @param {function} _callback  绘制完成回调函数
     * @param {object} option  参数
     */
    constructor(_callback: Function, option: object);
    _callback: Function;
    handler: any;
    scene: any;
    projectto(position: any, is3d: any): any[];
    active(): void;
    deactive(): void;
}
//# sourceMappingURL=CesiumLabelEditor.d.ts.map