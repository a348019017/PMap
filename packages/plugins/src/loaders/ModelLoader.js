/**
 * 模型加载类，处理gltf和3dtile的配置加载
 * @memberof Loaders
 * @class ModelLoader
 */
export class ModelLoader
{
    /**
     * 加载模型,当option的参数指定加载何种文件，暂时支持gltf等若干参数
     * @param {Cesium.Viewer} viewer 
     * @param {Object} option 
     * @param {string} option.type   gltf
     * @param {string} option.offset   [111,22,10]   //经纬度
     * @param {string} option.url  模型地址
     * @param {string} option.scale  模型缩放比例
     * @memberof Loaders.ModelLoader
     */
    static Load(viewer,element){
        let longitude = 111;
        let latitude = 23;
        let height = 0;
        //debugglatitudeer;
        if (element.offset) {
          longitude = element.offset[0];
          latitude = element.offset[1];
          height = element.offset[2];
        }
      
        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
          Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
        );
        var position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        //这里需要设置一个headingpitchroll
        var heading = Cesium.Math.toRadians(0);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      
        if (element.modelMatrix) {
            modelMatrix = Cesium.Matrix4.fromArray(element.modelMatrix);
        }
        //计算外包矩形，然后设定其贴地
        let mdl=  Cesium.Model.fromGltf({
           url:element.url,
           modelMatrix:modelMatrix,
           heightReference :0,
           scene:viewer.scene,
          //  minimumPixelSize: element.minimumPixelSize
          //      ? element.minimumPixelSize
          //      : 128,
          //   maximumScale: element.maximumScale ? element.maximumScale : 100,
            scale: element.scale ? element.scale : 1,
         })
         mdl.readyPromise.then(dd=>{
          //mdl.debugShowBoundingVolume=true;
         })
         
         viewer.scene.primitives.add(mdl);
         return mdl;
    }
}
