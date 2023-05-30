/**
 * 绘制矩形的包装类
 */
export class CesiumDrawRectangleTool {
    /**
     * @param {function} drawcomplete  绘制完成回调函数
     * @param {object} option  参数
     * @param {string} option.projection  返回geojson的参考系,默认"EPSG:4326"
     * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除,默认是贴地绘制的
     */
    constructor(callback: any, option: {
        projection: string;
        isclearwhencomplete: boolean;
    });
    viewer: any;
    callback: any;
    Cesium: any;
    floatingPoint: any;
    _rectangle: any;
    _rectangleLast: any;
    _positions: any[];
    _entities_point: any[];
    _entities_rectangle: any[];
    active(): void;
    deactive(): void;
    drawRectangle(): void;
    handler: any;
    stopDraw(): void;
    destroy(): void;
    clear(): void;
    getCatesian3FromPX(px: any): any;
}
//# sourceMappingURL=CesiumDrawRectangleTool.d.ts.map