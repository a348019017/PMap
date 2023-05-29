import ArrowPolyline from './model/ArrowPolyline'
import EventConstant from './constant/EventConstant'
import {cartesian3ToQuaternion, normalizingQuaternion, projectOnPlane, rayPlaneIntersection} from './math'
import AxisSphere from './model/AxisSphere'
import EventManager from './event/EventManager'
import {TilesetWrapper} from "./model/TilesetWrapper"


/**
 * 模型编辑类（带参考轴，旋转球）
 */
export  class TranslationController {

    /**
     * 视图
     * @type {Viewer}
     */
    viewer = null

    /**
     * 模型
     * @type {Cesium.Model}
     */
    model = null

    /**
     * 模型位置
     * @type {Cesium.Cartesian3}
     */
    position = null

    /**
     * z轴
     * @type {ArrowPolyline}
     */
    axisZ = null

    /**
     * x轴
     * @type {ArrowPolyline}
     */
    axisX = null

    /**
     * y轴
     * @type {ArrowPolyline}
     */
    axisY = null

    /**
     * 操作杆集合
     * @type {Cesium.PrimitiveCollection}
     */
    primitives = null

    /**
     * 从摄像头发出与视窗上一点相交的射线
     */
    pickRay = new Cesium.Ray()

    /**
     * 拾取到的位置
     * @type {Cesium.Cartesian3}
     */
    pickPoint = null

    /**
     * 当前操作轴
     * @type {ArrowPolyline}
     */
    axis = null

    /**
     * Z旋转轴
     * @type {AxisSphere}
     */
    axisSphereZ = null

    /**
     * X旋转轴
     * @type {AxisSphere}
     */
    axisSphereX = null

    /**
     * Y旋转轴
     * @type {AxisSphere}
     */
    axisSphereY = null

    /**
     * 辅助球
     * @type {Cesium.Primitive}
     */
    auxiliaryBall = null
    //模型半径
    radius = null
    //模型原始矩阵
    orgModelMatrix = null
    //是否允许旋转
    rotateEnable = null
    //是否允许移动
    moveEnable = null


    /**
   * 构造函数
   *
   * @param {Viewer} [viewer] 
   * @param {Cesium.Model||Cesium.Tileset||Cesium.ModelExpir} [model] 模型对象
   *
   * @alias TranslationController
   * @constructor
   */
    constructor(viewer, model) {
        this.viewer = viewer
        if (model instanceof Cesium.Cesium3DTileset) {
            model = new TilesetWrapper(model);
        }
        this.model = model
        this.rotateEnable = true
        this.moveEnable = true
        this.orgModelMatrix = this.model.modelMatrix.clone(new Cesium.Matrix4())
        this.position = Cesium.Matrix4.getTranslation(
            model.modelMatrix,
            new Cesium.Cartesian3()
        )
        this.primitives = new Cesium.PrimitiveCollection()
        this.viewer.baseViewer.scene.primitives.add(this.primitives)

        // 创建平移轴
        this._createRod()
        // 旋转平移轴
        this._rotationRod()
        // 添加平移轴
        this._addRod()

        // 创建旋转轴
        this._createSphereAxis()
        // 旋转旋转轴
        this._rotationSphereAxis()
        // 添加旋转轴
        this._addSphereAxis()
        // 添加辅助球
        this.auxiliaryBall = {
            show: true
        }
        this.addAuxiliaryBall(6, Cesium.Color.RED.withAlpha(0.2))
        this._initEventManager()
        // 添加监听器
        this._addListener()
    }

    //复原model
    resetModel() {
        this.model.modelMatrix = this.orgModelMatrix
        this._resetMaterial()
    }

    //初始化监听
    _initEventManager() {
        this.viewer.eventManager = new EventManager(this.viewer.baseViewer)
    }

    // 添加监听器
    _addListener() {
        this.viewer.eventManager.addEventListener(EventConstant.LEFT_DOWN, this._clickListener)
        this.viewer.eventManager.addEventListener(EventConstant.LEFT_UP, this._clickUpListener)
        this.viewer.eventManager.addEventListener(EventConstant.MOUSE_MOVE, this._moveListener)
    }

    // 清除操纵杆, 监听器
    destroy() {
        this.primitives.removeAll()
        this.viewer.baseViewer.scene.primitives.remove(this.primitives)
        this._removeListener()
        this.viewer.baseViewer.scene.screenSpaceCameraController.enableRotate = true
        this.viewer.baseViewer.scene.screenSpaceCameraController.enableTranslate = true
    }

    // 移除监听器
    _removeListener() {
        this.viewer.eventManager.removeEventListener(EventConstant.LEFT_DOWN, this._clickListener)
        this.viewer.eventManager.removeEventListener(EventConstant.LEFT_UP, this._clickUpListener)
        this.viewer.eventManager.removeEventListener(EventConstant.MOUSE_MOVE, this._moveListener)
    }

    // 创建操作杆
    _createRod() {
        
        const boundingShpere = this.model.boundingSphere
        const radius = boundingShpere.radius
        this.radius = radius

        const options = {
            width: (radius / 15) > 10 ? 10 : radius / 15,
            headWidth: (radius / 6) > 20 ? 20 : radius / 6,
            length: radius * 1,//坐标轴的长度应该视模型的直径而定
            headLength: (radius / 3) > 50 ? 50 : radius / 3,
            position: this.position
        }
        // 向上的向量
        const vectorNormalUp = new Cesium.Cartesian3()
        const vZ = new Cesium.Cartesian3(0, 0, 1)
        Cesium.Cartesian3.normalize(this.position.clone(), vectorNormalUp)

        // 向右的向量
        const vectorNormalRight = new Cesium.Cartesian3()
        // 由z轴向上 地表向上两个向量叉乘, 则可以得出, 向右的向量
        Cesium.Cartesian3.cross(vZ, vectorNormalUp, vectorNormalRight)

        // 向前的向量
        const vectorNormalFront = new Cesium.Cartesian3()
        Cesium.Cartesian3.cross(vectorNormalRight, vectorNormalUp, vectorNormalFront)
        Cesium.Cartesian3.multiplyByScalar(vectorNormalFront, -1, vectorNormalFront)

        this.axisX = new ArrowPolyline({
            id: 'axisX',
            color: Cesium.Color.GREEN,
            direction: vectorNormalRight,
            unit: Cesium.Cartesian3.UNIT_X,
            ...options
        })
        this.axisZ = new ArrowPolyline({
            id: 'axisZ',
            color: Cesium.Color.RED,
            direction: vectorNormalUp,
            unit: Cesium.Cartesian3.UNIT_Z,
            ...options
        })
        this.axisY = new ArrowPolyline({
            id: 'axisY',
            color: Cesium.Color.BLUE,
            direction: vectorNormalFront,
            unit: Cesium.Cartesian3.UNIT_Y,
            ...options
        })
    }

    // 添加操作杆
    _addRod() {
        this.primitives.add(this.axisZ.primitive)
        this.primitives.add(this.axisX.primitive)
        this.primitives.add(this.axisY.primitive)
    }

    // 初始化操作杆
    _rotationRod() {
        const mx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
        const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
        this.axisX.rotation(rotationX)
        const my = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90))
        const rotationY = Cesium.Matrix4.fromRotationTranslation(my)
        this.axisY.rotation(rotationY)
    }

    // 点击监听
    _clickListener = (e) => {
        if (this.translationAxisIsSelected() || this.rotationAxisIsSelected()) {
            this.viewer.baseViewer.scene.screenSpaceCameraController.enableRotate = false
            this.pickPoint = this.viewer.baseViewer.scene.pickPosition(e.message.position)
        }
    }

    /**
     * 平移轴被选中
     * @return {boolean}
     */
    translationAxisIsSelected() {
        return this.axisX.selected || this.axisY.selected || this.axisZ.selected
    }

    /**
     * 旋转轴被选中
     * @return {boolean}
     */
    rotationAxisIsSelected() {
        return this.axisSphereZ.selected || this.axisSphereX.selected || this.axisSphereY.selected
    }

    _clickUpListener = () => {
        this.pickPoint = null
        this.axis = null
        this.viewer.baseViewer.scene.screenSpaceCameraController.enableRotate = true
        this.auxiliaryBall.show = false
    }
    // 移动监听
    _moveListener = (e) => {
        
        const pick = this.viewer.baseViewer.scene.pick(e.message.endPosition)
        if (!this.viewer.eventManager.press) {
            this._resetMaterial()
        } else if (this.axis && this.viewer.eventManager.press) {
            this.translationAxisIsSelected() && this._precessTranslation(e, this.axis)
            this.rotationAxisIsSelected() && this._precessRotation(e, this.axis)
            return
        }
        if (pick && pick.id) {
            this._resetMaterial()
            let axis = null
            if (this.axisX.is(pick.id)) {
                axis = this.axisX
            } else if (this.axisY.is(pick.id)) {
                axis = this.axisY
            } else if (this.axisZ.is(pick.id)) {
                axis = this.axisZ
            } else if (this.axisSphereX.is(pick.id)) {
                axis = this.axisSphereX
            } else if (this.axisSphereY.is(pick.id)) {
                axis = this.axisSphereY
            } else if (this.axisSphereZ.is(pick.id)) {
                axis = this.axisSphereZ
            }
            if (axis) {
                this.axis = axis
                this.axis.select()
                if (this.rotationAxisIsSelected()) {
                    this.auxiliaryBall.show = true
                }
            }
        }
    }

    /**
     * 处理旋转
     * @param e
     * @param axis{AxisSphere}
     * @private
     */
    _precessRotation(e, axis) {
        this.auxiliaryBall.show = true
        if (!this.pickPoint) return

        let cartesian3 = this.viewer.baseViewer.scene.pickPosition(e.message.startPosition)
        Cesium.Cartesian3.subtract(cartesian3, this.position, cartesian3)
        const vtStart = projectOnPlane(cartesian3, axis.direction)

        cartesian3 = this.viewer.baseViewer.scene.pickPosition(e.message.endPosition)
        Cesium.Cartesian3.subtract(cartesian3, this.position, cartesian3)
        const vtEnd = projectOnPlane(cartesian3, axis.direction)

        const cartesian = Cesium.Cartesian3.cross(vtStart, vtEnd, new Cesium.Cartesian3())

        const angle = Cesium.Math.toDegrees(Cesium.Cartesian3.angleBetween(cartesian, axis.direction))
        // 利用叉乘性质判断方向
        let rotateAngleInRadians = Cesium.Cartesian3.angleBetween(vtEnd, vtStart)
        if (angle > 1) {
            rotateAngleInRadians = -rotateAngleInRadians
        }

        let mx = null
        if (axis.id === 'axisSphereX') {
            mx = Cesium.Matrix3.fromRotationX(rotateAngleInRadians)
        } else if (axis.id === 'axisSphereY') {
            mx = Cesium.Matrix3.fromRotationY(rotateAngleInRadians)
        } else if (axis.id === 'axisSphereZ') {
            mx = Cesium.Matrix3.fromRotationZ(rotateAngleInRadians)
        }
        const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
        this.rotation(rotationX, axis, rotateAngleInRadians)
    }

    /**
     *
     * @param rotationX{Cesium.Matrix4} 旋轉角度
     * @param axis{AxisSphere}
     * @param rotateAngleInRadians
     */
    rotation(rotationX, axis, rotateAngleInRadians) {
        this.axisSphereX.rotationAxis(rotationX)
        this.axisSphereY.rotationAxis(rotationX)
        this.axisSphereZ.rotationAxis(rotationX)
        this.axisX.rotationAxis(rotationX)
        this.axisY.rotationAxis(rotationX)
        this.axisZ.rotationAxis(rotationX)
        this.rotateVectorByAxisForAngle(this.axisX.direction, axis.direction, rotateAngleInRadians)
        this.rotateVectorByAxisForAngle(this.axisY.direction, axis.direction, rotateAngleInRadians)
        this.rotateVectorByAxisForAngle(this.axisZ.direction, axis.direction, rotateAngleInRadians)
        Cesium.Matrix4.multiply(
            this.model.modelMatrix,
            rotationX,
            this.model.modelMatrix
        )
        if(this.model.setRotation){
            this.model.setRotation(rotationX);
        }
        const number = Cesium.Math.toDegrees(rotateAngleInRadians)
        axis.updateAngle(number)
    }

    /**
     * 处理选中
     * @param e{{message: {startPosition: Cesium.Cartesian2, endPosition: Cesium.Cartesian2}}}
     * @param axis{ArrowPolyline}
     * @private
     */
    _precessTranslation(e, axis) {
        this.auxiliaryBall.show = false
        if (!this.pickPoint) return
        this.viewer.baseViewer.camera.getPickRay(e.message.startPosition, this.pickRay)
        const startPosition = rayPlaneIntersection(this.pickRay, this.viewer.baseViewer.camera.direction, this.pickPoint)
        this.viewer.baseViewer.camera.getPickRay(e.message.endPosition, this.pickRay)
        const endPosition = rayPlaneIntersection(this.pickRay, this.viewer.baseViewer.camera.direction, this.pickPoint)
        const moveVector = new Cesium.Cartesian3()
        Cesium.Cartesian3.subtract(endPosition, startPosition, moveVector)
        const moveLength = Cesium.Cartesian3.dot(axis.direction, moveVector)
        this.translation(moveVector, axis.unit, moveLength)
    }

    /**
     * 平移
     * @param moveVector
     * @param unit
     * @param moveLength
     */
    translation(moveVector, unit, moveLength) {
        this.axisX.translation(moveVector, unit, moveLength)
        this.axisY.translation(moveVector, unit, moveLength)
        this.axisZ.translation(moveVector, unit, moveLength)
        this.axisSphereX.translation(moveVector, unit, moveLength)
        this.axisSphereY.translation(moveVector, unit, moveLength)
        this.axisSphereZ.translation(moveVector, unit, moveLength)

        const matrix4 = this.model.modelMatrix.clone(new Cesium.Matrix4())
        //平移矩阵和当前模型矩阵相乘
        Cesium.Matrix4.multiplyByTranslation(
            this.model.modelMatrix,
            // Cesium.Cartesian3.multiplyByScalar(new Cesium.Cartesian3(-unit.y, unit.x, unit.z), moveLength, new Cesium.Cartesian3()),
            Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
            this.model.modelMatrix
        )
        //this.model.modelMatrix=
        
        //更新position模型当前的位置
        Cesium.Matrix4.getTranslation(this.model.modelMatrix, this.position)

        Cesium.Matrix4.subtract(this.model.modelMatrix, matrix4, matrix4)
        const cartesian3 = Cesium.Matrix4.getTranslation(matrix4, new Cesium.Cartesian3())

        if (this.model.setTranslation) {
            this.model.setTranslation(
                cartesian3
            );
        }

        Cesium.Matrix4.multiplyByTranslation(
            this.auxiliaryBall.modelMatrix,
            cartesian3,
            this.auxiliaryBall.modelMatrix
        )
    }

    // 复位所有的材质
    _resetMaterial() {
        this.axisX.rest()
        this.axisY.rest()
        this.axisZ.rest()
        this.axisSphereY.rest()
        this.axisSphereZ.rest()
        this.axisSphereX.rest()
        this.auxiliaryBall.show = false
    }

    // 创建 旋转轴
    _createSphereAxis() {
        const radius = this.radius * 2
        this.axisSphereZ = new AxisSphere('axisSphereZ', radius, this.position, Cesium.Color.RED)
        this.axisSphereX = new AxisSphere('axisSphereX', radius, this.position, Cesium.Color.GREEN)
        this.axisSphereY = new AxisSphere('axisSphereY', radius, this.position, Cesium.Color.BLUE)
        this.axisSphereZ.direction = this.axisZ.direction
        this.axisSphereX.direction = this.axisX.direction
        this.axisSphereY.direction = this.axisY.direction
    }

    // 旋转 旋转轴
    _rotationSphereAxis() {
        const mx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90))
        const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
        this.axisSphereX.rotation(rotationX)
        const my = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(90))
        const rotationY = Cesium.Matrix4.fromRotationTranslation(my)
        this.axisSphereY.rotation(rotationY)
    }

    // 添加旋转轴
    _addSphereAxis() {
        if (this.rotateEnable && !this.primitives.contains(this.axisSphereZ.primitive)) {
            this.primitives.add(this.axisSphereZ.primitive)
            //this.primitives.add(this.axisSphereY.primitive)
            //this.primitives.add(this.axisSphereX.primitive)
        } else if (this.rotateEnable === false) {
            this.primitives.remove(this.axisSphereZ.primitive)
            this.primitives.remove(this.axisSphereY.primitive)
            this.primitives.remove(this.axisSphereX.primitive)
        }

    }

    //开启旋转
    setEnableRotate(enabled) {
        this.rotateEnable = enabled
        this._addSphereAxis()
    }

    /**
     * 添加辅助球, 用于辅助位置拾取
     * @param {number} radius
     * @param {Cesium.Color} color
     */
    addAuxiliaryBall(radius, color) {
        // const cartesian3 = CesiumUtils.extended(this.position, -radius)
        const cartesian3 = this.position
        const modelMatrix = Cesium.Matrix4.multiplyByTranslation(
            Cesium.Transforms.eastNorthUpToFixedFrame(cartesian3),
            new Cesium.Cartesian3(0.0, 0.0, radius),
            new Cesium.Matrix4()
        );

        const sphereGeometry = new Cesium.SphereGeometry({
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
            radius: radius,
        });
        const sphereInstance = new Cesium.GeometryInstance({
            id: 'auxiliaryBall',
            geometry: sphereGeometry,
            modelMatrix: modelMatrix,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    color
                ),
            },
        });

        this.auxiliaryBall = this.primitives.add(
            new Cesium.Primitive({
                geometryInstances: sphereInstance,
                appearance: new Cesium.PerInstanceColorAppearance({
                    translucent: true,
                    closed: true,
                }),
            })
        )
        this.auxiliaryBall.show = true
    }

    /**
     * 通过轴旋转角度
     * @param vector
     * @param axis
     * @param angle
     */
    rotateVectorByAxisForAngle(vector, axis, angle) {
        const rotateQuaternion = normalizingQuaternion(Cesium.Quaternion.fromAxisAngle(axis, angle, new Cesium.Quaternion()))
        const quaternion = cartesian3ToQuaternion(vector)
        Cesium.Quaternion.multiply(
            Cesium.Quaternion.multiply(
                rotateQuaternion,
                quaternion,
                quaternion
            ),
            Cesium.Quaternion.inverse(rotateQuaternion, new Cesium.Quaternion()),
            quaternion
        )
        vector.x = quaternion.x
        vector.y = quaternion.y
        vector.z = quaternion.z
        return quaternion
    }
}
