/**
 * 绘制矩形的包装类
 */
export class CesiumDrawRectangleTool {
  /**
   * @param {function} drawcomplete  绘制完成回调函数
   * @param {object} option  参数
   * @param {string} option.projection  返回geojson的参考系,默认"EPSG:4326"
   * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除,默认是贴地绘制的
   */
  constructor(callback, option) {
    this.viewer = viewer;
    this.callback = callback;
    this.Cesium = Cesium;
    
  }
  /**
   * 激活功能
   */
  active() {
    this.clear();
    if (this.handler) {
      this.handler.destroy();
    }
    this.drawRectangle();
  }
  /**
   * 反激活功能
   */
  deactive() {
    this.clear();
    this.destroy();
  }
  drawRectangle() {
    let that = this;
    this.stopDraw();
    let positions = [];
    const canvas = this.viewer.scene.canvas;
    this.handler = new Cesium.ScreenSpaceEventHandler(canvas);
    this.handler.setInputAction((click) => {
      if (positions.length) return;
      var cartesian = this.getCatesian3FromPX(click.position);
      positions.push(cartesian, cartesian);
      that.rectangle = this.viewer.entities.add({
        name: "rectangle",
        rectangle: {
          coordinates: new Cesium.CallbackProperty(() => {
            let obj = Cesium.Rectangle.fromCartesianArray(positions);
            return obj;
          }, false),
          material: Cesium.Color.RED.withAlpha(0.5),
          zIndex: 100,
        },
      });
      this.handler.setInputAction((move) => {
        var cartesian = this.getCatesian3FromPX(move.endPosition);
        if (that.rectangle) {
          positions[positions.length - 1] = cartesian;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction((click) => {
      this.stopDraw();
      //回调参数
      if (that.drawcomplete) {
        let coordinates = that.rectangle.rectangle.coordinates.getValue();
        //一些实体例如entity或者geojson均可以回调出去
        that.drawcomplete(coordinates);
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }
  stopDraw() {
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
      // this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }
  //销毁
  destroy() {
    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
      this.viewer.scene.forceRender();
    }
  }
  //清空实体对象
  clear() {
    if (this.rectangle) {
      this.viewer.entities.remove(this.rectangle);
    }
  }

  getCatesian3FromPX(px) {
    var cartesian;
    var ray = this.viewer.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    return cartesian;
  }
}
