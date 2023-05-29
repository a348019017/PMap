/**
 * 退让分析包装类，使用classifyprimitive实现
 */
export class TRAnlaysisTool {
    /**
     *  this.xgtool = new TRAnlaysisTool();
     *  this.xgtool.Polygon=this.geojson; 设置多边形范围
     *  this.xgtool.Buildings = pmap.rowstoGeojson(dt.data.data,{}); 设置建筑底面
     *  this.xgtool.TRDistance= this.value1;  设置退让距离
     *  this.xgtool.clear();
     * @param {*} option
     * @param {*} tileset
     */
    constructor(option: any, tileset: any);
    tileset: any;
    _minheight: number;
    _maxheight: number;
    _buffersize: number;
    set showPolygon(arg: any);
    /**
     * 传入一个feature，GeoJSON对象
     */
    set Polygon(arg: any);
    _hole: any;
    centerWC: any;
    center: any;
    polygoncutEnty: any;
    set Buildings(arg: any);
    _buildings: any;
    getbufferhierarchy(distance: any): {
        pos: any;
        posturf: turf.helpers.Position[];
    } | undefined;
    _holecoords: any;
    /**
     * 设置退让的长度，这里就需要不断修改
     */
    set TRDistance(arg: any);
    polygoninnerEnty: any;
    polygonPrimitive: any;
    geojson2Primitive(geo: any): any;
    geojson2PolygonHierarchy(coordinates: any): any;
    geotopolygonGeomtry(coordinates: any): any;
    geojson2Primitives(geos: any): any;
    /**
     * 清除Cesium对象
     */
    clear(): void;
    /**
     * 释放和清理相关资源
     */
    destory(): void;
}
import * as turf from "@turf/turf";
//# sourceMappingURL=TRAnlaysisTool.d.ts.map