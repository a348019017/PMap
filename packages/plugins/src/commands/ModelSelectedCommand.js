
import * as turf from "@turf/turf"


/**
 * 模型高亮功能的包装，传入建筑底面，楼层等信息进行高亮操作,尚未支持分层分户模式
 * 此功能并未封装鼠标点击的操作，原因在于点击操作是通过点击查询多边形，然后设置高亮，可定义规范封装点击操作
 * 同时如果是单体化的模型，也可以封装进去
 */
export class ModelSelectedCommand {
  constructor(option) {
    //minheight可能需要用上，原因在于
    this._minheight = 0;
    this._maxheight = 100;
    //buffersize10m
    this._buffersize = 10;
    this._primitives=[];
    this.polygonPrimitive=undefined;
  }

  /**
   * 添加多边形覆盖层,传入geojsonfeature和buffer
   * buffer的目的是建筑底面和模型有误差
   * @param {GeoJSON} value 
   * @param {Number} buffersize 
   */
  setPolygon(value,buffersize){
    buffersize=buffersize!=undefined?buffersize:0;
    this.clear();
    if(buffersize){
      value= turf.buffer(value,buffersize,{units:"meters"})
    }
    let tprimitve= this.geojson2PrimitivesX(value);
    if (tprimitve) {
      this.polygonPrimitive=tprimitve;
      viewer.scene.primitives.add(tprimitve);
    }
  }

  /**
   * 添加多边形覆盖层,传入featureCollection和buffer
   * buffer的目的是建筑底面和模型有误差
   * @param {GeoJSON} value 
   * @param {Number} buffersize 
   */
    //添加多边形覆盖层,传入geojsonfeaturecollection
    setPolygons(value,buffersize){
      buffersize=buffersize!=undefined?buffersize:0;
      this.clear();
      if(buffersize){
        value= turf.buffer(value,buffersize,{units:"meters"})
      }
      let tprimitve= this.geojson2Primitives(value);
      if (tprimitve) {
        this.polygonPrimitive=tprimitve;
        viewer.scene.primitives.add(tprimitve);
      }
    }


  getbufferhierarchy(distance) {
    if (this._hole) {
      let hierarchy = this._hole;

      let coord = hierarchy.positions.map((i) => {
        let dd = Cesium.Cartographic.fromCartesian(i);
        return [
          Cesium.Math.toDegrees(dd.longitude),
          Cesium.Math.toDegrees(dd.latitude),
          dd.height,
        ];
      });
      //首尾相连
      coord.push(coord[0]);
      this._holecoords = coord;
      //绘制一个buffer，包含一个内嵌的洞，标红外部的区域
      let polygon = turf.polygon([coord]);
      let result = turf.buffer(polygon, distance, { units: "meters" });

      let resultCat = result.geometry.coordinates[0].flat();
      let pos = Cesium.Cartesian3.fromDegreesArray(resultCat);
      return { pos: pos, posturf: result.geometry.coordinates[0] };
    }
    return undefined;
  }


  //将geojson转换成primitive，用于单体化个体建筑,要求包含3d坐标,修改转换代码
  geojson2Primitive(geo) {
    
    let that=this;
    let rest = [];
    if (geo.type == "Polygon") {
        rest = [this.geotopolygonGeomtry(geo.coordinates)];
    } else if (geo.type == "MultiPolygon") {
        rest = geo.coordinates.map(i => {
            return that.geotopolygonGeomtry(i);
        });
    }
    let instances=rest.map(polygeo=>{
      var polygonInstance = new Cesium.GeometryInstance({
        geometry: polygeo,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5)
          ),
        },
      });
      return polygonInstance;
    })
    return instances;
  }


  geojson2PolygonHierarchy(coordinates){
    let is3d = coordinates[0][0].length === 3;
    let resultCat = coordinates[0].flat();
    let pos = [];
    if (is3d) {
      pos = Cesium.Cartesian3.fromDegreesArrayHeights(resultCat);
    } else {
      pos = Cesium.Cartesian3.fromDegreesArray(resultCat);
    }    
    var newhierarchy = new Cesium.PolygonHierarchy(pos);
    return newhierarchy;
  }

  //直接将坐标转换成Geometry
  geotopolygonGeomtry(coordinates)
  {
    let is3d = coordinates[0][0].length === 3;
    let resultCat = coordinates[0].flat();
    let pos = [];
    if (is3d) {
      pos = Cesium.Cartesian3.fromDegreesArrayHeights(resultCat);
    } else {
      pos = Cesium.Cartesian3.fromDegreesArray(resultCat);
    }    
    var newhierarchy = new Cesium.PolygonHierarchy(pos);
    let polygeo = new Cesium.PolygonGeometry({
      polygonHierarchy: newhierarchy,
      height: 0,
      extrudedHeight: 1000,
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
    });
    return polygeo;
  }


  geojson2Primitives(geos) {
    let that=this;
    let instances=geos.features.map(i=>{
      return that.geojson2Primitive(i.geometry);
    }).flat();
    let polygonPrimitive = new Cesium.ClassificationPrimitive({
      geometryInstances:instances,
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      asynchronous: false,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        translucent: true,
      }),
    });

    return  polygonPrimitive;

  }

  //
  geojson2PrimitivesX(geos) {
    if(geos.type=="Feature")
      geos=geos.geometry;
    let that=this;
    let instances= that.geojson2Primitive(geos).flat();

    let polygonPrimitive = new Cesium.ClassificationPrimitive({
      geometryInstances:instances,
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      asynchronous: false,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        translucent: true,
      }),
    });

    return  polygonPrimitive;

  }


  /**
   * 清除选中高亮效果
   */
  clear(){
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
  }

 
  /**
   *  释放和清理相关资源
   */
  destory() {
    
  }
}
