/**
 * 绘制圆形的包装类
 */
export class CesiumDrawCircleTool {
  /**
   * @param {function} drawcomplete  绘制完成回调函数
   * @param {object} option  参数
   * @param {string} option.projection  返回geojson的参考系,默认"EPSG:4326"
   * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除
   */
  constructor(_callback, option) {
    this.drawcomplete = _callback;

    //构造函数中作一些判断
    if (!viewer.scene.pickPositionSupported) {
      window.alert("This browser does not support pickPosition.");
    }

    //默认导出为4326参考系的点
    if (option && option.projection) {
      this.projection = option.projection ? option.projection : "EPSG:4326";
    }
    this.clampToGround = false;
    if (option && option.clampToGround) {
      this.clampToGround = option.clampToGround;
    }
    //this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    //右键结束的时候是否清除对象
    this.isclearwhencomplete = true;
    if (option && option.isclearwhencomplete === false) {
      this.isclearwhencomplete = false;
    }

    this.handler = null;
    this.circle_center_entity = null; // 圆心点 entity
    this.temporary_circle_entity = null; // 临时圆形entity
    this.circle_entity = null; // 结果圆形entity
    this.circle_end_point = null; // 结束点
    this.circle_center_point = null; // 圆心点
  }

  projectto(position) {
    var ellipsoid = viewer.scene.globe.ellipsoid;
    var cartesian3 = position;
    var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
    var lat = Cesium.Math.toDegrees(cartographic.latitude);
    var lng = Cesium.Math.toDegrees(cartographic.longitude);
    var alt = cartographic.height;
    return [lng, lat, alt];
  }

  /**
   * 激活功能
   */
  active() {
    if (this.circle_entity !== null) {
      viewer.entities.remove(this.circle_center_entity);
      viewer.entities.remove(this.temporary_circle_entity);
      viewer.entities.remove(this.circle_entity);
      this.circle_center_entity = null;
      this.temporary_circle_entity = null;
      this.circle_entity = null;
      this.circle_end_point = null;
      this.circle_center_point = null;
    }

    // 清除所有点击事件
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    let that = this;
    // 鼠标点击左键
    this.handler.setInputAction((event) => {
      // 屏幕坐标转为世界坐标
      let cartesian = viewer.scene.globe.pick(
        viewer.camera.getPickRay(event.position),
        viewer.scene
      );
      let ellipsoid = viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度

      // 判断圆心是否已经绘制，如果绘制了，再次点击左键的时候，就是绘制最终结果圆形
      if (that.circle_center_entity) {
        // 设置最终点
        that.circle_end_point = {
          lon: lon,
          lat: lat,
          height: 0,
        };
        // 绘制结果多边形
        that.draw_circle();
        // 清除事件
        that.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        that.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // 清除 绘制的中心点和临时圆
        viewer.entities.remove(that.circle_center_entity);
        viewer.entities.remove(that.temporary_circle_entity);
        //回调参数，返回其半径和圆心的笛卡尔坐标
        if (that.drawcomplete) {
          let output = {
            center: that.circle_center_point,
            radius: that._radius,
          };
          //一些实体例如entity或者geojson均可以回调出去
          that.drawcomplete(output);
        }
      } else {
        // 设置中心点坐标和结束点坐标
        that.circle_end_point = that.circle_center_point = {
          lon: lon,
          lat: lat,
          height: 0,
        };
        // 绘制圆心点
        that.create_circle_center_point([lon, lat]);
        // 开始绘制动态圆形
        that.draw_dynamic_circle(that.circle_center_point);

        // 鼠标移动--实时绘制圆形
        that.handler.setInputAction((event) => {
          // 屏幕坐标转为世界坐标
          let cartesian = viewer.scene.globe.pick(
            viewer.camera.getPickRay(event.endPosition),
            viewer.scene
          );
          let ellipsoid = viewer.scene.globe.ellipsoid;
          let cartographic = ellipsoid.cartesianToCartographic(cartesian);
          let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
          let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度

          if (that.temporary_circle_entity) {
            // 修改结束点-用于动态绘制圆形
            that.circle_end_point = {
              lon: lon,
              lat: lat,
              height: 0,
            };
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  create_circle_center_point(point_arr) {
    this.circle_center_entity = viewer.entities.add({
      // fromDegrees（经度，纬度，高度）以度为单位的经度和纬度值返回Cartesian3位置
      position: Cesium.Cartesian3.fromDegrees(point_arr[0], point_arr[1], 100),
      point: {
        // 点的大小（像素）
        pixelSize: 5,
        // 点位颜色，fromCssColorString 可以直接使用CSS颜色
        color: Cesium.Color.WHITE,
        // 边框颜色
        outlineColor: Cesium.Color.fromCssColorString("#fff"),
        // 边框宽度(像素)
        outlineWidth: 2,
        // 是否显示
        show: true,
      },
    });
  }

  draw_dynamic_circle(point) {
    let that = this;
    this.temporary_circle_entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
      ellipse: {
        // 半短轴（画圆：半短轴和半长轴一致即可）
        semiMinorAxis: new Cesium.CallbackProperty(() => {
          // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
          return that.two_points_distance(point, that.circle_end_point);
        }, false),
        // 半长轴
        semiMajorAxis: new Cesium.CallbackProperty(() => {
          // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
          return that.two_points_distance(point, that.circle_end_point);
        }, false),
        // 填充色
        material: Cesium.Color.RED.withAlpha(0.5),
        // 是否有边框
        outline: true,
        // 边框颜色
        outlineColor: Cesium.Color.WHITE,
        // 边框宽度
        outlineWidth: 4,
      },
    });
  }

  // 绘制结果圆形
  draw_circle() {
    this._radius = this.two_points_distance(
      this.circle_center_point,
      this.circle_end_point
    );
    this.circle_entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(
        this.circle_center_point.lon,
        this.circle_center_point.lat
      ),
      ellipse: {
        // 半短轴（画圆：半短轴和半长轴一致即可）
        semiMinorAxis: this.two_points_distance(
          this.circle_center_point,
          this.circle_end_point
        ),
        // 半长轴
        semiMajorAxis: this.two_points_distance(
          this.circle_center_point,
          this.circle_end_point
        ),
        // 填充色
        material: Cesium.Color.RED.withAlpha(0.5),
        // 是否有边框
        outline: true,
        // 边框颜色
        outlineColor: Cesium.Color.WHITE,
        // 边框宽度
        outlineWidth: 4,
      },
    });
  }

  // 根据经纬度计算两点之前的直线距离
  two_points_distance(start_point, end_point) {
    // 经纬度转换为世界坐标
    var start_position = Cesium.Cartesian3.fromDegrees(
      start_point.lon,
      start_point.lat,
      start_point.height
    );
    var end_position = Cesium.Cartesian3.fromDegrees(
      end_point.lon,
      end_point.lat,
      end_point.height
    );
    // 返回两个坐标的距离（单位：米）
    return Cesium.Cartesian3.distance(start_position, end_position);
  }

  /**
   * 反激活功能
   */
  deactive() {
    // 清除所有点击事件
    if (this.handler) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    if (this.circle_entity !== null) {
      viewer.entities.remove(this.circle_center_entity);
      viewer.entities.remove(this.temporary_circle_entity);
      viewer.entities.remove(this.circle_entity);
      this.circle_center_entity = null;
      this.temporary_circle_entity = null;
      this.circle_entity = null;
      this.circle_end_point = null;
      this.circle_center_point = null;
    }
  }
}
