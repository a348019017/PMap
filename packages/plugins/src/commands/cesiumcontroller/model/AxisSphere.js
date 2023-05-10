import Axis from './Axis'

export default class AxisSphere extends Axis {

    id = ''

    /**
     * 轴位置
     * @type {[]}
     */
    position = []

    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction = null

    /**
     * 轴的角度
     * @type {number}
     */
    angle = 0

    /**
     * 构造一个旋转轴
     * @param id{string} id
     * @param radius{number} 半径
     * @param position{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     */
    constructor (id, radius, position, color) {
        super()
        this.id = id
        this._color = color
        this._calculation(radius/3, position)
        this._createAxisSphere(id, position, color)
    }

    /**
     * 创建圆环轴
     * @param id{string} id
     * @param matrix{Cesium.Cartesian3} 位置
     * @param color{Cesium.Color} 颜色
     * @private
     */
    _createAxisSphere(id, position, color) {
        const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position)
        // Cesium.Matrix4.multiplyByTranslation(matrix,
        //     Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Z, 2000, new Cesium.Cartesian3()),
        //     matrix)
        const geometry = new Cesium.PolylineGeometry({
            positions: this.position,
            width: 10
        });
        const instance = new Cesium.GeometryInstance({
            geometry: geometry,
            id: id,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
        });
        this.primitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PolylineColorAppearance({
                translucent: false
            }),
            modelMatrix: matrix
        });
    }

    /**
     * 计算轴圆弧位置
     * @param radius{number}
     */
    _calculation (radius, position) {
        for (let i = 0; i <= 360; i += 3) {
            const sin = Math.sin(Cesium.Math.toRadians(i));
            const cos = Math.cos(Cesium.Math.toRadians(i));
            const x = radius * cos;
            const y = radius * sin;
            this.position.push(new Cesium.Cartesian3(x, y, 0));
        }
    }

    /**
     * 更新轴的角度
     * @param angle
     */
    updateAngle(angle) {
        this.angle += angle;
        if (this.angle >= 360) {
          this.angle = 0;
        }
        if (this.angle < 0) {
          this.angle = 360;
        }
        console.log("rotateZ:"+this.angle+"test:"+angle)
    }

    /**
     * 选中
     */
    select () {
        this.selected = true
    }

    // 复位颜色
    rest () {
        this.selected = false
    }
}
