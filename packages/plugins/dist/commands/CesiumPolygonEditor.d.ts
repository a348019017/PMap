/**
 * 单多边形编辑工具，viewer采用全局变量，可自选传入
 */
export class CesiumPolygonEditor {
    constructor(_callback: any, option: any);
    handler: any;
    scene: any;
    selectedPolygonCoordinates: any[];
    Poly_pointsCollections: any[];
    isPolygonClear: boolean;
    projectto(position: any, is3d: any): any[];
    set Polygon(arg: any);
    _polygon: any;
    set Positions(arg: any);
    set GeoJSON(arg: turf.helpers.Feature<turf.helpers.MultiPolygon, {
        name: string;
    }>);
    get GeoJSON(): turf.helpers.Feature<turf.helpers.MultiPolygon, {
        name: string;
    }>;
    _polygonEnty: any;
    draw_Zone_Corner_points(pos: any, name: any): void;
    UpdatepolygonWithPoints(pickedEntity: any): void;
    active(): void;
    deactive(): void;
    destory(): void;
}
import * as turf from "@turf/turf";
//# sourceMappingURL=CesiumPolygonEditor.d.ts.map