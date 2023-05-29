export default class ArrowPolyline extends Axis {
    /**
     * 箭头线
     */
    constructor(option?: {});
    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction: Cesium.Cartesian3;
    /**
     * 哪个轴
     * @type {Cartesian3}
     */
    unit: Cartesian3;
    _width: any;
    _headWidth: any;
    _length: any;
    _headLength: any;
    _inverse: any;
    position: any;
    /**
     * 按上面的方法画出的箭头在线的中间，我们需要把它平移到线的一端
     */
    translate(geometry: any, offset: any): void;
}
import Axis from './Axis';
//# sourceMappingURL=ArrowPolyline.d.ts.map