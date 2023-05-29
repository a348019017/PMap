





/**
 * 标注，包含billboard编辑器
 */
export class CesiumLabelEditor {
  /**
   * @param {function} _callback  绘制完成回调函数
   * @param {object} option  参数
   */
  constructor(_callback, option) {
    //this._editorEntities=option.entities;
    this._callback = _callback;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    this.scene = viewer.scene;
  }

  projectto(position, is3d) {
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian3 = position;
    var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var alt = cartographic.height;
    if (is3d) {
      return [lng, lat, alt];
    } else {
      return [lng, lat];
    }
  }

  active() {
    let that = this;
    let dragging = false;
    let pickedEntity = undefined;
    //viewer.scene.globe.depthTestAgainstTerrain = true;

    this.handler.setInputAction(function (click) {
      var pickedObject = that.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        //编辑标注
        if (pickedObject.id.label) {
          pickedObject.id.label.scale = 1.2;
          dragging = true;
          pickedEntity = pickedObject.id;
          that.scene.screenSpaceCameraController.enableRotate = false;
        }
      } else {
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction(function (movement) {
      if (dragging && pickedEntity) {
        //屏幕坐标转经纬度
        var newCartesian = viewer.scene.pickPosition(movement.endPosition);
        if (newCartesian) {
          pickedEntity.position.setValue(newCartesian);
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function (event) {
      if (pickedEntity && dragging) {
        dragging = false;
        pickedEntity.label.scale = 1.0;
        if (that._callback) {
          that._callback(pickedEntity);
        }
        pickedEntity = undefined;
        that.scene.screenSpaceCameraController.enableRotate = true;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  deactive() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);

    // //清除掉相关资源
    // viewer.entities.remove(this.floatingPoint);
    // viewer.entities.remove(this.activeShape);
    // for (let index = 0; index < this.Poly_pointsCollections.length; index++) {
    //   const element = this.Poly_pointsCollections[index];
    //   viewer.entities.remove(element);
    // }
    // if (this.isPolygonClear && this._polygonEnty) {
    //   viewer.entities.remove(this._polygonEnty);
    // }
    // this.selectedPolygonCoordinates = [];
    // this.Poly_pointsCollections = [];
  }
}



