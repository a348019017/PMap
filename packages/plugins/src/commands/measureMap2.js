//距离测量类
import * as turf from "@turf/turf";
import { calculateDistance } from "../util/Distance";
import { calculateArea, calculateClampArea } from '../util/Area';

/**
 * 版本2的测量封装,有些和vue相关的代码耦合，可能需要修改后使用
 * 如需回调可继承emitevent来实现，或者最简单的function回调
 * 
 */
export  class CesiumMeasurement {
  /**
   * 
   * @param {*} viewer 
   * @param {*} that   Vue组件的引用
   * @constructor
   */
  constructor(viewer, that) {
    this.$that = that;
    this.viewer = viewer;
    this.initEvents();
    this.vertexEntities = [];
    this.labelEntity = undefined;
    this.measureDistance = 0; //测量结果
    this.areaNum = 0;

    this.tooltip = document.getElementById("toolTip");
    this._layer = new Cesium.CustomDataSource("ddddd");
    this.viewer.dataSources.add(this._layer);
    this.calculateClampDistanceData = [];
  }

  //初始化事件
  initEvents() {
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )

    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    // this.MeasureStartEvent = new Cesium.Event(); //开始事件
    // this.MeasureEndEvent = new Cesium.Event(); //结束事件        
  }

  
  /**
   *  空间距离测量
   */
  measureSpatialDistance() {
    this._distance(false)
  }

  /**
   * 开始测量贴地距离
   */
  measureClampDistance() {
    this._distance(true)
  }

  /**
   * 空间面积测量
   */
  measureSpatialArea() {
    this._measureArea(false);
  }

  /**
   * 开始测量贴地面积
   */
  measureClampArea() {
    this._measureArea(true);
  }

  //激活
  activate() {
    if (!this._layer) {
      this._layer = new Cesium.CustomDataSource("ddddd");
      this.viewer.dataSources.add(this._layer);
    }
    this.deactivate();
    //设置鼠标状态 
    this.viewer.enableCursorStyle = false;
    this.viewer._element.style.cursor = 'default';
    this.isMeasure = true;
    this.measureDistance = 0;
    this.tooltip.style.display = "block";
  }

  //禁用
  deactivate() {
    if (!this.isMeasure) return;
    this.unRegisterEvents();
    this.viewer._element.style.cursor = 'pointer';
    this.viewer.enableCursorStyle = true;
    this.isMeasure = false;
    this.tooltip.style.display = "none";
  }

  //清空绘制
  clear() {
    if (this._layer) {
      this.viewer.dataSources.remove(this._layer);
      this._layer = undefined
    }
    this.vertexEntities = [];
  }

  //创建线节点
  createVertex(positions, clamp) {
    const calculateFn = clamp ? this.calculateClampDistance : this.spaceDistance;
    let vertexEntity = this._layer.entities.add({
      position: positions[positions.length - 1],
      id: "MeasureDistanceVertex" + positions[positions.length - 1],
      type: "MeasureDistanceVertex",
      label: {
        text: calculateFn(positions, this.viewer) + "米",
        scale: 1,
        font: "18px sans-serif",
        fillColor: Cesium.Color.GOLD,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
        //scaleByDistance: new Cesium.NearFarScalar(1000, 1, 3000, 0.4),
        pixelOffset: new Cesium.Cartesian2(20, -20),
      },
      point: {
        color: Cesium.Color.FUCHSIA,
        pixelSize: 8,
        disableDepthTestDistance: 500,
      },
    });
    this.vertexEntities.push(vertexEntity);
  }

  //创建面节点
  createPolygonVertex(positions) {
    let vertexEntity = this._layer.entities.add({
      position: positions[positions.length - 1],
      type: "MeasureAreaVertex",
      point: {
        color: Cesium.Color.FUCHSIA,
        pixelSize: 8,
        disableDepthTestDistance: 500,
      },
    });
    this.vertexEntities.push(vertexEntity);
  }


  //获取节点的中心点
  getCenterPosition(tempPositions) {
    let points = [];
    if (tempPositions.length < 3) return tempPositions[0];
    tempPositions.forEach(position => {
      const point3d = this.cartesian3ToPoint3D(position);
      points.push([point3d.x, point3d.y]);
    })

    //构建turf.js  lineString
    let geo = turf.lineString(points);
    let bbox = turf.bbox(geo);
    let bboxPolygon = turf.bboxPolygon(bbox);
    let pointOnFeature = turf.center(bboxPolygon);
    let lonLat = pointOnFeature.geometry.coordinates;

    return Cesium.Cartesian3.fromDegrees(lonLat[0], lonLat[1], this.height + 0.3);
  }

  //注册鼠标事件
  registerEvents() {
    this.leftClickEvent();
    this.rightClickEvent();
    this.mouseMoveEvent();
  }

  _distance(clamp = false) {
    let positions = [];
    let tempPositions = [];
    this.activate();
    var cartesian = null;
    let _self = this;
    this.handler.setInputAction(e => {
      if (!this.isMeasure) return;
      this.tooltip.style.left = e.endPosition.x + 3 + "px";
      this.tooltip.style.top = e.endPosition.y + 45 + "px";
      this.tooltip.innerHTML =
        '<span style="color: #fff; font-size: 14px">单击开始，双击结束</span>';
      this.viewer._element.style.cursor = 'default';

      let ray = this.viewer.camera.getPickRay(e.endPosition);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      //cartesian = this.getCart3ByPosition(e.endPosition)

      if (!cartesian) return;
      if (positions.length < 1) return;
      tempPositions = positions.concat(cartesian);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //单击鼠标左键画点点击事件
    this.handler.setInputAction(e => {
      this.viewer._element.style.cursor = 'default';

      let ray = this.viewer.camera.getPickRay(e.position);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      //cartesian = this.getCart3ByPosition(e.position)

      if (!cartesian) return;
      positions.push(cartesian);
      if (positions.length == 1) { //首次点击  
        this.lineEntity = this._layer.entities.add({
          polyline: {
            positions: new Cesium.CallbackProperty(e => {
              return tempPositions;
            }, false),
            width: 2,
            clampToGround: clamp,
            classificationType: Cesium.ClassificationType.BOTH,
            material: Cesium.Color.YELLOW,
            depthFailMaterial: Cesium.Color.YELLOW
          }
        })
        return;
      }
      console.log({ positions })
      this.createVertex(positions, clamp);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(e => {
      this.$that.eventBus.$emit("unOnHandlerEvents", false)
      if (!_self.isMeasure || positions.length < 1) {
        _self.deactivate();
        //this.clear();
      } else {
        _self.measureEnd();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  _measureArea(clamp = false) {
    var cartesian = null;
    const calculateFn = clamp ? calculateClampArea : calculateArea// this.computeArea; calculateArea
    this.activate();
    let positions = [];
    let tempPositions = [];
    this.mesureResultEntity = null;
    let areaSquar = 0;
    this.handler.setInputAction(e => {
      if (!this.isMeasure) return;
      this.tooltip.style.left = e.endPosition.x + 3 + "px";
      this.tooltip.style.top = e.endPosition.y + 45 + "px";
      this.tooltip.innerHTML =
        '<span style="color: #fff; font-size: 14px">单击开始，双击结束</span>';
      this.viewer._element.style.cursor = 'default';

      let ray = this.viewer.camera.getPickRay(e.endPosition);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      //cartesian = this.getCart3ByPosition(e.endPosition)

      if (!cartesian) return;

      if (positions.length < 1) return;
      this.height = this.unifiedHeight(positions, this.height);
      tempPositions = positions.concat(cartesian);//点集合
      if (tempPositions.length >= 3 && !this.mesureResultEntity) {
        areaSquar = calculateFn(tempPositions, this.viewer);
        // console.log("areaSquar1", tempPositions, areaSquar);
        this.mesureResultEntity = this._layer.entities.add({
          position: new Cesium.CallbackProperty(e => {
            return this.getCenterPosition(tempPositions)
          }, false),
          type: "MeasureAreaResult",
          label: {
            text: new Cesium.CallbackProperty(e => {
              return areaSquar + " 平方米";
            }, false),
            scale: 1,
            font: "18px sans-serif",
            fillColor: Cesium.Color.GOLD,
            showBackground: true,
            //backgroundColor: Cesium.Color.fromCssColorString('#67ADDF'),
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            //distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
            //scaleByDistance: new Cesium.NearFarScalar(1000, 1, 30000, 0.5),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            //pixelOffset: new Cesium.Cartesian2(0, -30),
          },
        });
      }else if(tempPositions.length > 3){
        this.mesureResultEntity=null;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //单击鼠标左键画点点击事件
    this.handler.setInputAction(e => {
      this.viewer._element.style.cursor = 'default';

      let ray = this.viewer.camera.getPickRay(e.position);
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      //cartesian = this.getCart3ByPosition(e.position)

      if (!cartesian) return;
      positions.push(cartesian);
      this.height = this.unifiedHeight(positions, this.height);
      if (positions.length == 1) { //首次点击  
        this.polygonEntity = this._layer.entities.add({
          polygon: {
            hierarchy: new Cesium.CallbackProperty(e => {
              return new Cesium.PolygonHierarchy(tempPositions);
            }, false),
            material: Cesium.Color.RED.withAlpha(0.4),
            clampToGround: clamp,
            heightReference: clamp ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE,
            perPositionHeight: clamp === false,
            classificationType: Cesium.ClassificationType.BOTH,
          },
          polyline: {
            clampToGround: clamp,
            positions: new Cesium.CallbackProperty(e => {
              return tempPositions.concat(tempPositions[0]);
            }, false),
            width: 1,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.YELLOW,
            }),
            depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.YELLOW,
            }),
          }
        })
      }
      this.createPolygonVertex(positions);

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    let _self = this;
    this.handler.setInputAction(e => {
      this.$that.eventBus.$emit("unOnHandlerEvents", false)
      // let areaSquar = calculateFn(tempPositions, this.viewer);
      // console.log("areaSquar2",tempPositions,areaSquar);
      let isReadOnly = this.$that.eventBus.$emit("getIsReadOnly");
      if (isReadOnly) {
        let ssArea = (areaSquar / 10000).toFixed(2);
        this.$that.eventBus.$emit("drawLoseArea", ssArea);
        let pointPositions = [];
        tempPositions.forEach((item) => {
          let cartesian = new Cesium.Cartesian3(item.x, item.y, item.z);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let y = Cesium.Math.toDegrees(cartographic.latitude);
          let x = Cesium.Math.toDegrees(cartographic.longitude);
          let point = [x, y];
          pointPositions.push(point);
        })
        let cartesian1 = new Cesium.Cartesian3(tempPositions[0].x, tempPositions[0].y, tempPositions[0].z);
        let cartographic1 = Cesium.Cartographic.fromCartesian(cartesian1);
        let endX = Cesium.Math.toDegrees(cartographic1.longitude)
        let endY = Cesium.Math.toDegrees(cartographic1.latitude);
        let endPoint = [endX, endY];
        pointPositions.push(endPoint);
        this.getFitlerData(pointPositions);
      }
      if (!this.isMeasure || positions.length < 3) {
        this.deactivate();
        //this.clear();
      } else {
        this.mesureResultEntity = null
        this.measureEnd();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  getFitlerData(tempPositions) {
    let data = {
      tempPositions: tempPositions,
      filter: "dlbm like '03%'",
      page: 0,
      size: 1000,
      outFields: "dlmc,xiao_ban_xj,lin_zhong,you_shi_sz",
    }
    debugger
    let _self = this;
    this.$that.eventBus.$emit(
      "getPolygonData",
      data.tempPositions,
      data.filter,
      function (data) {
        debugger
        // console.log(data);
        let dataRecords = data.records;
        let results = [];
        dataRecords.forEach((item, index) => {
          let shapeCenter;
          if (item.shape) {
            shapeCenter = _self.getCenterPoint(item.shape);
          } else {
            shapeCenter = _self.getCenterPoint(item.geom);
          }
          item["shape"] = item.shape || item.geom;
          item["lon"] = shapeCenter.geometry.coordinates[0];
          item["lat"] = shapeCenter.geometry.coordinates[1];
          item["id"] = index;
          results.push(item);
        });
        _self.$that.eventBus.$emit("getDisplayData",results);
      },
      data.page,
      data.size,
      data.outFields
    );
  }
  getCenterPoint(shape) {
    let multipolygon = JSON.parse(shape);
    // console.log(multipolygon);
    let centerPoint = {};
    let polygons = [];
    let tur_f = this.turf;
    if (multipolygon.type == "Polygon") {
      if (Array.isArray(multipolygon.coordinates[0]))
        centerPoint = {
          geometry: {
            coordinates: multipolygon.coordinates[0][0],
          },
        };
      else
        centerPoint = {
          geometry: {
            coordinates: multipolygon.coordinates[0],
          },
        };
    } else {
      for (var j = 0; j < multipolygon.coordinates.length; j++) {
        var polygon = turf.polygon(multipolygon.coordinates[j]);
        polygons.push(polygon);
      }
      centerPoint = turf.center(polygons[0]);
    }
    return centerPoint;
  }
  computeArea(points) {
    var pointsCount = points.length,
      area = 0.0,
      d2r = Math.PI / 180,
      p1,
      p2;

    if (pointsCount > 2) {
      for (var i = 0; i < pointsCount; i++) {
        var pt1 = points[i];
        var pt2 = points[(i + 1) % pointsCount];

        var cartographic1 = Cesium.Cartographic.fromCartesian(pt1);
        var lng1 = Cesium.Math.toDegrees(cartographic1.longitude);
        var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
        var heigh1 = cartographic1.height;

        var cartographic2 = Cesium.Cartographic.fromCartesian(pt2);
        var lng2 = Cesium.Math.toDegrees(cartographic2.longitude);
        var lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
        var heigh2 = cartographic2.height;

        p1 = {
          lon: lng1,
          lat: lat1,
          heigh: heigh1
        }
        p2 = {
          lon: lng2,
          lat: lat2,
          heigh: heigh2
        }

        area +=
          (p2.lon - p1.lon) *
          d2r *
          (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
      }
      area = (area * 6378137.0 * 6378137.0) / 2.0;
    }
    let area1 = Math.abs(area);
    return Number(area1).toFixed(4) + " 平方米";
  }

  //统一节点的高度
  unifiedHeight(positions, height) {
    if (!height) height = this.getPositionHeight(positions[0]); //如果没有指定高度 就用第一个的高度
    return height;
  }
  //获取某个点的高度
  getPositionHeight(position) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    return cartographic.height;
  }

  cartesian3ToPoint3D(position) {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    return { x: lon, y: lat, z: cartographic.height };
  }

  spaceDistance(positions) {
    console.log({ positions })
    var distance = 0;
    for (var i = 0; i < positions.length - 1; i++) {
      var point1cartographic = Cesium.Cartographic.fromCartesian(
        positions[i]
      );
      var point2cartographic = Cesium.Cartographic.fromCartesian(
        positions[i + 1]
      );
      /**根据经纬度计算出距离**/
      var geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(point1cartographic, point2cartographic);
      var s = geodesic.surfaceDistance;
      //返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
      distance = distance + s;
    }
    return distance.toFixed(2);
  }

  calculateClampDistance(pts, viewer) {
    var zdistance = 0;
    for (var i = 0; i < pts.length - 1; i++) {

      const startPosition = pts[i];
      const endPosition = pts[i + 1]

      const linearDistance = Cesium.Cartesian3.distance(startPosition, endPosition);
      console.log({ linearDistance })
      const count = Math.min(Math.floor(linearDistance), 2000);
      const positions = [];
      //
      console.log({ count })
      for (let i = 0; i < count; i++) {
        const cart3 = Cesium.Cartesian3.lerp(
          startPosition,
          endPosition,
          i / count,
          new Cesium.Cartesian3()
        );
        const cartographic = Cesium.Cartographic.fromCartesian(cart3);
        cartographic.height = viewer.scene.globe.getHeight(cartographic);

        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let height = cartographic.height || 0;

        positions.push({ lng, lat, height });
      }
      console.log({ positions })
      let distance = 0;
      positions.forEach((p, i, arr) => {
        if (i > 0) {
          distance += calculateDistance(arr[i], arr[i - 1]);
        }
      });
      zdistance += distance
    }
    console.log(zdistance)
    return zdistance.toFixed(2);
  }

  //测量结束
  measureEnd() {
    this.deactivate();
  }

  //解除鼠标事件
  unRegisterEvents() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  getCart3ByPosition(position) {
    let cart3;
    if (this.viewer.scene.pickPositionSupported) {
      cart3 = this.viewer.scene.pickPosition(position);
    }
    if (cart3 === undefined) {
      const ray = this.viewer.camera.getPickRay(position);
      cart3 = this.viewer.scene.globe.pick(ray, this.viewer.scene);
    }
    return cart3
  }
}
