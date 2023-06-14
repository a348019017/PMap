
export function calculateDistance(point1, point2) {
  const c1 = Cesium.Cartographic.fromDegrees(
    point1.lng,
    point1.lat,
    point1.height
  );
  const c2 = Cesium.Cartographic.fromDegrees(
    point2.lng,
    point2.lat,
    point2.height
  );
  const geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(c1, c2);
  let distance = geodesic.surfaceDistance;
  distance = Math.sqrt(Math.pow(distance, 2) + Math.pow(c2.height - c1.height, 2));
  return distance;
}

// export function calculateClampDistance(point1, point2, viewer) {
//   const startPosition = point1.toCartesian3();
//   const endPosition = point2.toCartesian3();
//   const linearDistance = Cesium.Cartesian3.distance(startPosition, endPosition);
//   const count = Math.min(Math.floor(linearDistance), 500);
//   const positions = [];
//   //
//   for (let i = 0; i < count; i++) {
//     const cart3 = Cesium.Cartesian3.lerp(
//       startPosition,
//       endPosition,
//       i / count,
//       new Cesium.Cartesian3()
//     );
//     const cartographic = Cesium.Cartographic.fromCartesian(cart3);
//     cartographic.height = viewer.scene.globe.getHeight(cartographic);
//     positions.push(Point3d.fromCartographic(cartographic));
//   }
//   let distance = 0;
//   positions.forEach((p, i, arr) => {
//     if (i > 0) {
//       distance += calculateDistance(arr[i], arr[i - 1]);
//     }
//   });
//   return distance;
// }
