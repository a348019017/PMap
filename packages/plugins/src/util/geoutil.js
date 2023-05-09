//import * as turf from "@turf/turf"

//工具一组多边形，计算间距
export function getNearestLine(featurecollection,option){
     //两两相交计算，这里采用JTS库的distanceOp.nearestPoints,过滤掉在顶点的点线
      let maxdistance=option.maxdistance?option.maxdistance:100;
      //过滤最多点位，按距离排序，最多五组线，反正杂乱，这里暂不考虑
      let maxcount=option.maxcount?option.maxcount:2;
      //过滤掉非南北向的数据的荣限制
      let tollerance=option.tollerance?option.tollerance:10;//10度以内都考虑，数据量更大可以考虑索引
}


//行数据集转换成geojson，用于加载
// export function rowstoGeojson(rows, option) {
//   //let rheight = option && option.height ? option.height : undefined;
//   let features = rows.map((i) => {
//     //处理高度的复写
//     if (option.height != undefined) {
//       i.geometry.coordinates.forEach((j) => {
//         j[2] = option.height;
//       });
//     }
//     return turf.feature(i.geometry, i);
//   });
//   features = turf.featureCollection(features);
//   return features;
// }

  

//geojson转换成entity对象
 export function geojson2Entity(geo) {
   let rest = [];
   if (geo.type == "Polygon") {
     rest = [geotopolygonGeomtry(geo.coordinates)];
   } else if (geo.type == "MultiPolygon") {
     rest = geo.coordinates.map((i) => {
       return geotopolygonGeomtry(i);
     });
   }
   //转换成多个entity
   let entities = rest.map((r) => {
     let _polygon = viewer.entities.add({
       polygon: {
         hierarchy: r._polygonHierarchy,
         material: Cesium.Color.RED.withAlpha(0.5),
         clampToGround: true,
         width: 5,
       },
     });
     return _polygon;
   });
   return entities;
 }


  //将geojson转换成primitive，用于单体化个体建筑,要求包含3d坐标,修改转换代码
   function geojson2Primitive(geo) {
    let rest = [];
    if (geo.type == "Polygon") {
        rest = [geotopolygonGeomtry(geo.coordinates)];
    } else if (geo.type == "MultiPolygon") {
        rest = geo.coordinates.map(i => {
            return geotopolygonGeomtry(i);
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


  //直接将坐标转换成Geometry
  function geotopolygonGeomtry(coordinates)
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


  //转换成primitives
  export function geojson2Primitives(geos) {
    let instances=geos.features.map(i=>{
      return geojson2Primitive(i.geometry);
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


  export function geojson2Primitives2(geos) {
    let instances=geos.features.map(i=>{
      return geojson2Primitive(i.geometry);
    }).flat();
    let polygonPrimitive = new Cesium.Primitive({
      geometryInstances:instances,
      asynchronous: false,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        translucent: true,
      }),
    });

    return  polygonPrimitive;

  }
