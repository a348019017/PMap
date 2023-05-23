
import * as turf from "@turf/turf"
//import "@turf/boolean-intersects"

/**
 * 退让分析包装类，使用classifyprimitive实现
 */
export class TRAnlaysisTool {



  /**
   *  this.xgtool = new TRAnlaysisTool();
   *  this.xgtool.Polygon=this.geojson; 设置多边形范围
   *  this.xgtool.Buildings = pmap.rowstoGeojson(dt.data.data,{}); 设置建筑底面
   *  this.xgtool.TRDistance= this.value1;  设置退让距离
   *  this.xgtool.clear();
   * @param {*} option 
   * @param {*} tileset 
   */
  constructor(option, tileset) {
    //右键结束绘制，返回全部的点geojson
    this.tileset = tileset;
    //minheight可能需要用上，原因在于
    this._minheight = 0;
    this._maxheight = 100;
    //buffersize10m
    this._buffersize = 10;
  }

  //显示横截面
  set showPolygon(value) {}


  /**
   * 传入一个feature，GeoJSON对象
   */
  set Polygon(geojson) {
    if(!geojson)
       return
    let type=geojson.type;
    let hierarchy=undefined;
    //这里不支持MultiplePOLYGON
    if (type == "Polygon") {
        hierarchy = this.geojson2PolygonHierarchy(geojson.coordinates);
    } else if (type == "MultiPolygon") {
        hierarchy = this.geojson2PolygonHierarchy(geojson.coordinates[0]);
    }
    //处理geojson
    this._hole = hierarchy;

    this.centerWC = Cesium.BoundingSphere.fromPoints(
      hierarchy.positions
    ).center;
    this.center = Cesium.Cartographic.fromCartesian(this.centerWC);

    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }

    this.polygoncutEnty = viewer.entities.add({
      name: "Red polygon on surface",
      polygon: {
        hierarchy: hierarchy,
        material: Cesium.Color.CYAN.withAlpha(0.1),
        outline: true,
        outlineColor: Cesium.Color.BLACK,
      },
    });
  }

  //设置需要参与分析的建筑物数据，可通过空间查询之后传入，主要参与实时的求交计算，暂不建立索引，不采用频繁查询数据库
  set Buildings(geojson) {
    this._buildings = geojson;
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

  /**
   * 设置退让的长度，这里就需要不断修改
   */
  set TRDistance(value) {
    //内部采用虚线绘制
    if (this.polygoninnerEnty) {
      viewer.entities.remove(this.polygoninnerEnty);
    }
    debugger
    var { pos, posturf } = this.getbufferhierarchy(-value);
    this.polygoninnerEnty = viewer.entities.add({
      name: "inner polygon",
      polyline: {
        positions: pos,
        material: Cesium.Color.RED.withAlpha(0.5),
        clampToGround: true,
        width: 5,
      },
    });

    //重构classifyPrimitive
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    

    let geocutpolygon = turf.polygon([this._holecoords, posturf]);

    //同时处理
    if (this._buildings) {
      let _intersectpolygons = this._buildings.features.filter((fea) => {
        return turf.booleanIntersects(fea, geocutpolygon);
      });
      
      this.polygonPrimitive=this.geojson2Primitives(turf.featureCollection(_intersectpolygons));
      viewer.scene.primitives.add(this.polygonPrimitive);
    }

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

  /**
   * 清除Cesium对象
   */
  clear(){
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }
    if (this.polygoninnerEnty) {
      viewer.entities.remove(this.polygoninnerEnty);
    }
  }

  /**
   * 释放和清理相关资源
   */
  destory() {
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }
    if (this.polygoninnerEnty) {
      viewer.entities.remove(this.polygoninnerEnty);
    }
  }
}
