/**
 * 绘制圆形的包装类
 */
export class CesiumDrawCircleTool {
    /**
     * @param {function} drawcomplete  绘制完成回调函数
     * @param {object} option  参数
     * @param {string} option.projection  返回geojson的参考系,默认"EPSG:4326"
     * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除
     */
    constructor(_callback: any, option: {
        projection: string;
        isclearwhencomplete: boolean;
    });
    drawcomplete: any;
    projection: string | undefined;
    clampToGround: any;
    isclearwhencomplete: boolean;
    handler: any;
    circle_center_entity: any;
    temporary_circle_entity: any;
    circle_entity: any;
    circle_end_point: any;
    circle_center_point: any;
    projectto(position: any): any[];
    /**
     * 激活功能
     */
    active(): void;
    create_circle_center_point(point_arr: any): void;
    draw_dynamic_circle(point: any): void;
    draw_circle(): void;
    _radius: any;
    two_points_distance(start_point: any, end_point: any): any;
    /**
     * 反激活功能
     */
    deactive(): void;
}
//# sourceMappingURL=CesiumdrawCircleTool.d.ts.map