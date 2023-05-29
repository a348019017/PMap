/**
 * 模型编辑类（带参考轴，旋转球）
 */
export class TranslationController {
    constructor(viewer: any, model: any);
    /**
     * 视图
     * @type {Viewer}
     */
    viewer: Viewer;
    /**
     * 模型
     * @type {Cesium.Model}
     */
    model: Cesium.Model;
    /**
     * 模型位置
     * @type {Cesium.Cartesian3}
     */
    position: Cesium.Cartesian3;
    /**
     * z轴
     * @type {ArrowPolyline}
     */
    axisZ: ArrowPolyline;
    /**
     * x轴
     * @type {ArrowPolyline}
     */
    axisX: ArrowPolyline;
    /**
     * y轴
     * @type {ArrowPolyline}
     */
    axisY: ArrowPolyline;
    /**
     * 操作杆集合
     * @type {Cesium.PrimitiveCollection}
     */
    primitives: Cesium.PrimitiveCollection;
    /**
     * 从摄像头发出与视窗上一点相交的射线
     */
    pickRay: any;
    /**
     * 拾取到的位置
     * @type {Cesium.Cartesian3}
     */
    pickPoint: Cesium.Cartesian3;
    /**
     * 当前操作轴
     * @type {ArrowPolyline}
     */
    axis: ArrowPolyline;
    /**
     * Z旋转轴
     * @type {AxisSphere}
     */
    axisSphereZ: AxisSphere;
    /**
     * X旋转轴
     * @type {AxisSphere}
     */
    axisSphereX: AxisSphere;
    /**
     * Y旋转轴
     * @type {AxisSphere}
     */
    axisSphereY: AxisSphere;
    /**
     * 辅助球
     * @type {Cesium.Primitive}
     */
    auxiliaryBall: Cesium.Primitive;
    radius: null;
    orgModelMatrix: null;
    rotateEnable: null;
    moveEnable: null;
    resetModel(): void;
    _initEventManager(): void;
    _addListener(): void;
    destroy(): void;
    _removeListener(): void;
    _createRod(): void;
    _addRod(): void;
    _rotationRod(): void;
    _clickListener: (e: any) => void;
    /**
     * 平移轴被选中
     * @return {boolean}
     */
    translationAxisIsSelected(): boolean;
    /**
     * 旋转轴被选中
     * @return {boolean}
     */
    rotationAxisIsSelected(): boolean;
    _clickUpListener: () => void;
    _moveListener: (e: any) => void;
    /**
     * 处理旋转
     * @param e
     * @param axis{AxisSphere}
     * @private
     */
    private _precessRotation;
    /**
     *
     * @param rotationX{Cesium.Matrix4} 旋轉角度
     * @param axis{AxisSphere}
     * @param rotateAngleInRadians
     */
    rotation(rotationX: Cesium.Matrix4, axis: AxisSphere, rotateAngleInRadians: any): void;
    /**
     * 处理选中
     * @param e{{message: {startPosition: Cesium.Cartesian2, endPosition: Cesium.Cartesian2}}}
     * @param axis{ArrowPolyline}
     * @private
     */
    private _precessTranslation;
    /**
     * 平移
     * @param moveVector
     * @param unit
     * @param moveLength
     */
    translation(moveVector: any, unit: any, moveLength: any): void;
    _resetMaterial(): void;
    _createSphereAxis(): void;
    _rotationSphereAxis(): void;
    _addSphereAxis(): void;
    setEnableRotate(enabled: any): void;
    /**
     * 添加辅助球, 用于辅助位置拾取
     * @param {number} radius
     * @param {Cesium.Color} color
     */
    addAuxiliaryBall(radius: number, color: Cesium.Color): void;
    /**
     * 通过轴旋转角度
     * @param vector
     * @param axis
     * @param angle
     */
    rotateVectorByAxisForAngle(vector: any, axis: any, angle: any): any;
}
import ArrowPolyline from './model/ArrowPolyline';
import AxisSphere from './model/AxisSphere';
//# sourceMappingURL=controller.d.ts.map