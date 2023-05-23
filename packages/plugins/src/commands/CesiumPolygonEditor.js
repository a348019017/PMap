import * as turf from "@turf/turf"
import { GUID } from "../util/util";
import { geojson2Entity } from "../util/geoutil";

/**
 * 单多边形编辑工具，viewer采用全局变量，可自选传入
 */
export class CesiumPolygonEditor {
  constructor(_callback, option) {
    // if(option.polygon){

    // }

   
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    this.scene = viewer.scene;
    this.selectedPolygonCoordinates = [];
    this.Poly_pointsCollections = [];
    this.isPolygonClear = false;
    //仅支持单图形编辑
    // this.drawcomplete = _callback;

    // //构造函数中作一些判断
    // if (!viewer.scene.pickPositionSupported) {
    //     window.alert("This browser does not support pickPosition.");
    // }
    // //默认绘制线
    // this.drawingMode = "line";
    // if (option && option.drawingMode) {
    //     this.drawingMode = option.drawingMode;
    // }
    // //默认导出为4326参考系的点
    // if (option && option.projection) {
    //     this.projection = option.projection ? option.projection : "EPSG:4326";
    // }
    // this.clampToGround = false;
    // if (option && option.clampToGround) {
    //     this.clampToGround = option.clampToGround;
    // }

    // this.activeShapePoints = [];
    // this.activeShape = undefined;
    // this.activePoints = [];
    // this.floatingPoint = undefined;

    // //右键结束的时候是否清除对象
    // this.isclearwhencomplete = true;
    // if (option && option.isclearwhencomplete === false) {
    //     this.isclearwhencomplete = false;
    // }
  }

  projectto(position,is3d) {
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

  //设置当前操作的polygon,这里传入polygonGraphic，如果是其它对象再说
  set Polygon(value) {
    this.isPolygonClear = false;
    this._polygon = value;
    let positions = this._polygon.hierarchy._value.positions;
    let length=positions.length;
    
    for (let index = 0; index < length-1; index++) {
      const p = positions[index];
      this.draw_Zone_Corner_points(p, "Polypoint_1");
    }
  }

  //设置点位以期内部管理
  set Positions(value) {
    this.isPolygonClear = true;
    this._polygon = viewer.entities.add({
      name: "editorpolygon",
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(value),
        material: Cesium.Color.RED.withAlpha(0.5),
        clampToGround: true,
        width: 5,
      },
    });
    let positions = this._polygon.hierarchy._value.positions;
    let length=positions.length;
    
    for (let index = 0; index < length-1; index++) {
      const p = positions[index];
      this.draw_Zone_Corner_points(p, "Polypoint_1");
    }
  }

  //设置点位，暂只支持单多边形
  set GeoJSON(value) {
    this.isPolygonClear = true;
    let entities = geojson2Entity(value);
    if (entities && entities.length > 0) {
    } else {
      console.log("加载的geojson不符合规则！");
    }
    //只操作第一个
    this._polygon = entities[0].polygon;
    this._polygonEnty = entities[0];
    let positions = this._polygon.hierarchy._value.positions;
    let length=positions.length;
    
    for (let index = 0; index < length-1; index++) {
      const p = positions[index];
      this.draw_Zone_Corner_points(p, "Polypoint_1");
    }
  }

  get GeoJSON() {
    let that = this;

    let pos = this.Poly_pointsCollections.map((i) => {
      //转换成经纬度然后turf
      return i.position._value;
    });
    let coords = pos.map((p) => {
      return that.projectto(p,false);
    });

    //验证首尾是否相连
    let length=coords.length;
    let lastPoint=coords[length-1];
    let firstPoint=coords[0];
    if(lastPoint[0]!=firstPoint[0]||lastPoint[1]!=firstPoint[1])
    {
      coords.push(firstPoint);  
    }
    //给予一个随机guid作为名称，返回multiplepolygon对象
    let geojson = turf.multiPolygon([[coords]], { name: GUID() });
    return geojson;
  }

  //绘制点
  draw_Zone_Corner_points(pos, name) {
    var carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(pos);
    var lon = Cesium.Math.toDegrees(carto.longitude);
    var lat = Cesium.Math.toDegrees(carto.latitude);

    var pointGeometry = viewer.entities.add({
      name: name,
      position: pos,
      description: [lon, lat],
      point: {
        color: Cesium.Color.SKYBLUE,
        pixelSize: 10,
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 3,
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // we can see points arounds earth
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
    this.Poly_pointsCollections.push(pointGeometry);
  }

  UpdatepolygonWithPoints(pickedEntity) {
    let pos = this.Poly_pointsCollections.map((i) => {
      return i.position._value;
    });

    if (this._polygon) {
      let that = this;
      this._polygon.hierarchy = new Cesium.PolygonHierarchy(pos);
    }
  }

  active() {
    //this.selectedPolygonCoordinates = [];
    //this.Poly_pointsCollections = [];
    var dragging = false;
    var rightEntityPicked = false;
    var dragging = false;
    var pickedEntity;
    var mouseDroped = false;
    var ZoneMoment = true;
    let that = this;

    viewer.scene.globe.depthTestAgainstTerrain = true;

    this.handler.setInputAction(function (click) {
      if (ZoneMoment) {
        var pickedObject = that.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          var entityName = pickedObject.id._name;
          if (entityName) {
            entityName = entityName.split("_");
            if (entityName[0] === "Polypoint") {
              rightEntityPicked = true;
            }
            if (rightEntityPicked) {
              dragging = true;
              that.scene.screenSpaceCameraController.enableRotate = false;
              pickedEntity = pickedObject;
            }
          } else {
          }
        } else {
          ;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction(function (movement) {
      if (ZoneMoment && dragging) {
        //屏幕坐标转经纬度
        var newCartesian = viewer.scene.pickPosition(movement.endPosition);
        //   var newCartographic =
        //     viewer.scene.globe.ellipsoid.cartesianToCartographic(
        //       newCartesian
        //     );

        //   cartographic.longitude = newCartographic.longitude;
        //   cartographic.latitude = newCartographic.latitude;
        if (newCartesian) {
          pickedEntity.id.position.setValue(newCartesian);
          that.UpdatepolygonWithPoints(pickedEntity);
        }
      }
      if (dragging) {
        mouseDroped = true;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function (event) {
      if (ZoneMoment && rightEntityPicked && mouseDroped) {
        console.log("Left up ");
        dragging = false;
        mouseDroped = false;
        that.scene.screenSpaceCameraController.enableRotate = true;

        that.UpdatepolygonWithPoints(pickedEntity);
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
    for (let index = 0; index < this.Poly_pointsCollections.length; index++) {
      const element = this.Poly_pointsCollections[index];
      viewer.entities.remove(element);
    }
    if (this.isPolygonClear && this._polygonEnty) {
      viewer.entities.remove(this._polygonEnty);
    }
    this.selectedPolygonCoordinates = [];
    this.Poly_pointsCollections = [];
  }

  destory(){
    
  }
}



