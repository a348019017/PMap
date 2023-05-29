export default class AxisSphere extends Axis {
    /**
     * 构造一个旋转轴
     * @param id{string} id
     * @param radius{number} 半径
     * @param position{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     */
    constructor(id: string, radius: number, position: Cesium.Cartesian3, color: Cesium.Color);
    id: string;
    /**
     * 轴位置
     * @type {[]}
     */
    position: [];
    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction: Cesium.Cartesian3;
    /**
     * 轴的角度
     * @type {number}
     */
    angle: number;
    /**
     * 创建圆环轴
     * @param id{string} id
     * @param matrix{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     * @private
     */
    private _createAxisSphere;
    /**
     * 计算轴圆弧位置
     * @param radius{number}
     */
    _calculation(radius: number, position: any): void;
    /**
     * 更新轴的角度
     * @param angle
     */
    updateAngle(angle: any): void;
}
import Axis from './Axis';
//# sourceMappingURL=AxisSphere.d.ts.map