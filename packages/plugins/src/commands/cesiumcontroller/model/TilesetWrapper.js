

//tileset有些特殊，这里不适用model对象的参数，考虑获取其boundingbox，设置其matrix最好
//保存的时候需要同时记录matrix以及transform
export class TilesetWrapper {
    constructor(tileset) {
        this._tileset = tileset;

        let box = tileset.root.boundingVolume._orientedBoundingBox;
        let center = Cesium.Cartographic.fromCartesian(box.center);
        this._center=center;

        this._modelMatrix= Cesium.Transforms.eastNorthUpToFixedFrame(box.center);

        //this._tileset.debugShowBoundingVolume =true;
        //如果是强制贴地的模型会有一个偏移的参数，transform中会有体现
        //this._offsetHeight=tileset._offsetHeight;
    }

    get modelMatrix() {
        //如果此transform的原点很低的情况下，可能不能直接使用transform和修改transform，需要在此基础上添加偏移值
        return this._modelMatrix;
    }

    set modelMatrix(value){
        //计算每次的偏移差，然后修改真实的tarnsform,这是一个思路
        
        //this._tileset.root.transform=value;
    }

    setTranslation(value){
        Cesium.Matrix4.multiplyByTranslation(
            this._tileset.modelMatrix,
            // Cesium.Cartesian3.multiplyByScalar(new Cesium.Cartesian3(-unit.y, unit.x, unit.z), moveLength, new Cesium.Cartesian3()),
            value,
            this._tileset.modelMatrix
        )
    }

    setRotation(value)
    {
        // var mx = Cesium.Matrix3.fromRotationX(0.01);
        // const rotationX = Cesium.Matrix4.fromRotationTranslation(mx)
        Cesium.Matrix4.multiply(
            this._tileset.root.transform,
            // Cesium.Cartesian3.multiplyByScalar(new Cesium.Cartesian3(-unit.y, unit.x, unit.z), moveLength, new Cesium.Cartesian3()),
            value,
            this._tileset.root.transform
        )
    }

    get boundingSphere(){
       return  this._tileset.boundingSphere;
    }
}
