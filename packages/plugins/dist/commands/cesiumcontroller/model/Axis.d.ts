export default class Axis {
    /**
     * 实体
     * @type {Cesium.Primitive}
     */
    primitive: Cesium.Primitive;
    /**
     * 选中状态
     * @type {boolean}
     */
    selected: boolean;
    /**
     * 轴的颜色
     * @type {Cesium.Color}
     * @private
     */
    private _color;
    /**
     * 平移
     * @param moveVector{Cesium.Cartesian3} 移动距离
     * @param unit
     * @param moveLength
     */
    translation(moveVector: Cesium.Cartesian3, unit: any, moveLength: any): void;
    /**
     * 旋转轴
     * @param {Cesium.Matrix4} rotation
     */
    rotationAxis(rotation: Cesium.Matrix4): void;
    /**
     * 旋转
     * @param rotationX{Cesium.Matrix4} 旋转角度
     */
    rotation(rotationX: Cesium.Matrix4): void;
    instance: any;
    rest(): void;
    select(): void;
    /**
     * 是否是当前轴
     * @param id
     * @return {boolean}
     */
    is(id: any): boolean;
}
//# sourceMappingURL=Axis.d.ts.map