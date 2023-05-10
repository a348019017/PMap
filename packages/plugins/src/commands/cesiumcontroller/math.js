export const projectOnPlane = (vp, vn) => {
    const vt = new Cesium.Cartesian3()
    const multi = new Cesium.Cartesian3()
    const divide = new Cesium.Cartesian3()
    const cartesian3 = Cesium.Cartesian3.multiplyByScalar(vn, Cesium.Cartesian3.dot(vp, vn), multi);
    Cesium.Cartesian3.divideByScalar(
        cartesian3,
        Cesium.Cartesian3.dot(vn, vn),
        divide
    )
    Cesium.Cartesian3.subtract(vp, divide, vt)
    return vt
}

export const rayPlaneIntersection = (ray, cameraDirection, pickPoint, result = new Cesium.Cartesian3()) => {
    if (!pickPoint) {
        throw new Error("cuowu")
        return
    }
    const number = Cesium.Cartesian3.dot(cameraDirection, pickPoint);
    const number1 = Cesium.Cartesian3.dot(cameraDirection, ray.origin);
    const number2 = Cesium.Cartesian3.dot(cameraDirection, ray.direction);
    const t = (number - number1) / number2
    return Cesium.Cartesian3.add(ray.origin, Cesium.Cartesian3.multiplyByScalar(ray.direction, t, result), result)
}
export const cartesian3ToQuaternion = (cartesian3) => {
    return new Cesium.Quaternion(
        cartesian3.x,
        cartesian3.y,
        cartesian3.z,
        0
    )
}

function moduloQuaternion(quaternion) {
    let result = Math.sqrt(quaternion.x*quaternion.x + quaternion.y*quaternion.y + quaternion.z*quaternion.z+ quaternion.w*quaternion.w)
    console.log(result)
    return result
}

export const normalizingQuaternion = (quaternion) => {
    // Normalize( q ) = q/ |q| = q / (x*x + y*y + z*z + w*w)
    return Cesium.Quaternion.divideByScalar(
        quaternion,
        moduloQuaternion(quaternion),
        quaternion
    )
}
