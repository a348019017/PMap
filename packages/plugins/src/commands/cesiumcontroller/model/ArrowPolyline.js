import Axis from './Axis'

export default class ArrowPolyline extends Axis {

    /**
     * 方向
     * @type {Cesium.Cartesian3}
     */
    direction = null

    /**
     * 哪个轴
     * @type {Cartesian3}
     */
    unit = null

    /**
     * 箭头线
     */
    constructor(option = {}) {
        super()
        this._color = option.color || Cesium.Color.RED;
        this._width = option.width || 3;
        this._headWidth = option.headWidth || 2 * this._width;
        this._length = option.length || 300
        this._headLength = option.headLength || 10
        this._inverse = option.inverse || false
        this.position = option.position
        this.direction = option.direction
        this.unit = option.unit
        const id = option.id
        //这里用的是圆锥几何对象，当topRadius和bottomRadius相同时，它就是一个圆柱
        const line = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
            length: this._length,
            topRadius: this._width,
            bottomRadius: this._width
        }));
        const arrow = Cesium.CylinderGeometry.createGeometry(new Cesium.CylinderGeometry({
            length: this._headLength,
            topRadius: 0,
            bottomRadius: this._headWidth
        }));
        let offset = (this._length + this._headLength) / 2
        if (this._inverse) {
            offset = -offset
        }

        this.translate(arrow, [0, 0, offset]);
        let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.position)
        // Cesium.Matrix4.multiplyByTranslation(modelMatrix,
        //     Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.UNIT_Z, 2000, new Cesium.Cartesian3()),
        //     modelMatrix)
        this.primitive = new Cesium.Primitive({
            modelMatrix: modelMatrix,
            geometryInstances: [new Cesium.GeometryInstance(
                {
                    id: id + '-line',
                    geometry: line,
                }
            ),
                new Cesium.GeometryInstance({
                    id: id + '-arrow',
                    geometry: arrow,
                })],
            appearance: new Cesium.MaterialAppearance({
                material: Cesium.Material.fromType('Color', {color: this._color})
            }),
            asynchronous: false
        });
    }

    /**
     * 按上面的方法画出的箭头在线的中间，我们需要把它平移到线的一端
     */
    translate(geometry, offset) {
        const scratchOffset = new Cesium.Cartesian3();
        if (Array.isArray(offset)) {
            scratchOffset.x = offset[0];
            scratchOffset.y = offset[1];
            scratchOffset.z = offset[2];
        } else {
            Cesium.Cartesian3.clone(offset, scratchOffset);
        }

        for (let i = 0; i < geometry.attributes.position.values.length; i += 3) {
            geometry.attributes.position.values[i] += scratchOffset.x;
            geometry.attributes.position.values[i + 1] += scratchOffset.y;
            geometry.attributes.position.values[i + 2] += scratchOffset.z;
        }
    }
}
