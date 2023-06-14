

// 计算面状图形面积
function getAreaInternal(points) {
  const pointsCount = points.length;
  let area = 0.0;
  const d2r = Math.PI / 180;
  let p1;
  let p2;
  if (pointsCount > 2) {
    for (let i = 0; i < pointsCount; i++) {

      var pt1 = points[i];
      var pt2 = points[(i + 1) % pointsCount];
      var cartographic1 = Cesium.Cartographic.fromCartesian( pt1  );
      var lng1= Cesium.Math.toDegrees(cartographic1.longitude);
      var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
      var heigh1 = cartographic1.height;

      var cartographic2 = Cesium.Cartographic.fromCartesian( pt2  );
      var lng2= Cesium.Math.toDegrees(cartographic2.longitude);
      var lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
      var heigh2 = cartographic2.height;

      p1 = {
        lng:lng1,
        lat:lat1,
        heigh:heigh1
      }
      p2 = {
        lng:lng2,
        lat:lat2,
        heigh:heigh2
      }
      // p1 = points[i];
      // p2 = points[(i + 1) % pointsCount];
      area += ((p2.lng - p1.lng) * d2r)
          * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
    }
    area = (area * 6378137.0 * 6378137.0) / 2.0;
  }
  return Math.abs(area);
}

export function calculateArea(points) {
  let area1 = Math.abs(getAreaInternal(points));
  return  Number(area1).toFixed(2) 
}

export function calculateArea2(points) {// 经纬度数据
  const pointsCount = points.length;
  let area = 0.0;
  const d2r = Math.PI / 180;
  let p1;
  let p2;
  if (pointsCount > 2) {
    for (let i = 0; i < pointsCount; i++) {
      p1 = points[i];
      p2 = points[(i + 1) % pointsCount];
      area += ((p2.lng - p1.lng) * d2r)
          * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
    }
    area = (area * 6378137.0 * 6378137.0) / 2.0;
  }
  return Math.abs(area);
}

export function calculateClampArea(points, viewer) {
  const lengthDegree = Math.sqrt(getAreaInternal(points)) / 111000;
  const granularity = (Cesium.Math.RADIANS_PER_DEGREE * lengthDegree) / 5;
  // const granularity = Math.PI / Math.pow(2, 11) / fix;
  const polygonGeom = Cesium.PolygonGeometry.fromPositions({
    positions: points,
    vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    granularity,
  });
  const geom = Cesium.PolygonGeometry.createGeometry(polygonGeom);
  const indices = geom.indices;
  const attrPosition = geom.attributes.position;
  let area = 0.0;
  for (let i = 0; i < indices.length; i += 3) {
    const i1 = indices[i];
    const i2 = indices[i + 1];
    const i3 = indices[i + 2];
    const car1 = new Cesium.Cartesian3(
      attrPosition.values[i1 * 3],
      geom.attributes.position.values[i1 * 3 + 1],
      attrPosition.values[i1 * 3 + 2]
    );
    const car2 = new Cesium.Cartesian3(
      attrPosition.values[i2 * 3],
      geom.attributes.position.values[i2 * 3 + 1],
      attrPosition.values[i2 * 3 + 2]
    );
    const car3 = new Cesium.Cartesian3(
      attrPosition.values[i3 * 3],
      geom.attributes.position.values[i3 * 3 + 1],
      attrPosition.values[i3 * 3 + 2]
    );
    const points = [fromCartesian3(car1), fromCartesian3(car2),fromCartesian3(car3)];
    points.forEach(p => {
      p.height = sampleHeight(viewer, p);
    });
    area += calculateArea2(points);
  }
  return Number(area).toFixed(2) ;
}

export function fromCartesian3(cart3) {
  let cartographic = Cesium.Cartographic.fromCartesian(cart3);
  let lng = Cesium.Math.toDegrees(cartographic.longitude);
  let lat = Cesium.Math.toDegrees(cartographic.latitude);
  let height = cartographic.height || 0;
 return  {lng,lat,height}
}

export function sampleHeight(viewer, point, option = {}) {
  const carto = Cesium.Cartographic.fromDegrees(point.lng, point.lat);
  if (option.wholeScene === true) {
    let height = viewer.scene.sampleHeight(
      carto,
      option.objectsToExclude || []
    );
    if (height === undefined) {
      height = viewer.scene.globe.getHeight(carto);
    }
    return height;
  }
  if (
    viewer.scene.globe.terrainProvider instanceof
    Cesium.EllipsoidTerrainProvider
  ) {
    return 0;
  }
  return viewer.scene.globe.getHeight(carto);
}
