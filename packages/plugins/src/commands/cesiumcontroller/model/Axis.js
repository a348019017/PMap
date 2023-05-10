export default class Axis {
    /**
     * 实体
     * @type {Cesium.Primitive}
     */
    primitive = null

    /**
     * 选中状态
     * @type {boolean}
     */
    selected = false

    /**
     * 轴的颜色
     * @type {Cesium.Color}
     * @private
     */
    _color = null

    /**
     * 平移
     * @param moveVector{Cesium.Cartesian3} 移动距离
     * @param unit
     * @param moveLength
     */
    translation(moveVector, unit, moveLength) {
        Cesium.Matrix4.multiplyByTranslation(
            this.primitive.modelMatrix,
            Cesium.Cartesian3.multiplyByScalar(unit, moveLength, new Cesium.Cartesian3()),
            this.primitive.modelMatrix
        )
    }

    /**
     * 旋转轴
     * @param {Cesium.Matrix4} rotation
     */
    rotationAxis(rotation){
        Cesium.Matrix4.multiply(
            this.primitive.modelMatrix,
            rotation,
            this.primitive.modelMatrix,
        )
    }

    /**
     * 旋转
     * @param rotationX{Cesium.Matrix4} 旋转角度
     */
    rotation(rotationX) {
        this.instance = []
        if (this.primitive.geometryInstances.constructor === Array) {
            this.instance = this.primitive.geometryInstances
        } else {
            this.instance = [this.primitive.geometryInstances]
        }
        for (let i = 0; i < this.instance.length; i++) {
            Cesium.Matrix4.multiply(
                this.instance[i].modelMatrix,
                rotationX,
                this.instance[i].modelMatrix
            )
        }
    }

    // 复位颜色
    rest() {
        this.selected = false
        this.primitive.appearance.material.uniforms.color = this._color
    }

    // 选中
    select() {
        this.selected = true
        this.primitive.appearance.material.uniforms.color = Cesium.Color.WHITE
    }

    /**
     * 是否是当前轴
     * @param id
     * @return {boolean}
     */
    is(id) {
        return !!this.primitive._instanceIds.find(item => item === id)
    }
}
