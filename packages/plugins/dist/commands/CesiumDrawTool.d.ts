export namespace DrawingMode {
    const DrawPolygon: string;
    const DrawLine: string;
}
/**
 * 绘制线面的封装
 */
export class CesiumDrawTool {
    /**
     * @param {function} _callback  绘制完成回调函数
     * @param {object} option  参数
     * @param {DrawMode} option.drawingMode  参数
     * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除
     */
    constructor(_callback: Function, option: {
        drawingMode: DrawMode;
        isclearwhencomplete: boolean;
    });
    drawcomplete: Function;
    drawingMode: any;
    projection: any;
    clampToGround: any;
    activeShapePoints: any[];
    activeShape: any;
    activePoints: any[];
    floatingPoint: any;
    handler: any;
    isclearwhencomplete: boolean;
    projectto(position: any): any[];
    setTransform(value: any): void;
    _transform: any;
    /**
     * 激活
     */
    active(): void;
    /**
     * 反激活
     */
    deactive(): void;
    terminateShape(): void;
    drawShape(positionData: any): any;
    createPoint(worldPosition: any): any;
}
//# sourceMappingURL=CesiumDrawTool.d.ts.map