

import * as turf from "@turf/turf"
import { GUID } from "../util/util";


export const DrawingMode={
    DrawPolygon:"polygon",
    DrawLine:"line"
}

/**
 * 绘制线面的封装
 * @alias CesiumDrawTool
 */
export class CesiumDrawTool {
    /**
     * @param {function} _callback  绘制完成回调函数
     * @param {object} option  参数
     * @param {DrawMode} option.drawingMode  参数
     * @param {boolean} option.isclearwhencomplete  绘制完成后是否自行移除
     */
    constructor(_callback, option) {
        
        this.drawcomplete = _callback;

        //构造函数中作一些判断
        if (!viewer.scene.pickPositionSupported) {
            window.alert("This browser does not support pickPosition.");
        }
        //默认绘制线
        this.drawingMode = "line";
        if (option && option.drawingMode) {
            this.drawingMode = option.drawingMode;
        }
        //默认导出为4326参考系的点
        if (option && option.projection) {
            this.projection = option.projection ? option.projection : "EPSG:4326";
        }
        this.clampToGround = false;
        if (option && option.clampToGround) {
            this.clampToGround = option.clampToGround;
        }

        this.activeShapePoints = [];
        this.activeShape = undefined;
        this.activePoints = [];
        this.floatingPoint = undefined;

        this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
        //右键结束的时候是否清除对象
        this.isclearwhencomplete = true;
        if (option && option.isclearwhencomplete === false) {
            this.isclearwhencomplete = false;
        }
    }


    projectto(position) {
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var cartesian3 = position;
        if(this._transform){
            cartesian3=Cesium.Matrix4.multiplyByPoint(this._transform,cartesian3,new Cesium.Cartesian3)
            return [cartesian3.x, cartesian3.y, cartesian3.z];
        }
        var cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return [lng, lat, alt]
    }

    //设置转换
    setTransform(value){
        this._transform=value;
    }

    /**
     * 激活
     */
    active() {

        this.activeShapePoints = [];
        this.activeShape = undefined;
        this.activePoints = [];
        this.floatingPoint = undefined;
        //暂时不详
        // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        //     Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        // );
        //必须开启深度测试，这时候桥在地形下方
        viewer.scene.globe.depthTestAgainstTerrain = true
        let that = this;

        this.handler.setInputAction(function (event) {
            // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
            // we get the correct point when mousing over terrain.
            var earthPosition = viewer.scene.pickPosition(event.position);
            // `earthPosition` will be undefined if our mouse is not over the globe.
            if (Cesium.defined(earthPosition)) {
                if (that.activeShapePoints.length === 0) {
                    that.floatingPoint = that.createPoint(earthPosition);
                    that.activeShapePoints.push(earthPosition);
                    var dynamicPositions = new Cesium.CallbackProperty(function () {
                        if (that.drawingMode === "polygon") {
                            return new Cesium.PolygonHierarchy(that.activeShapePoints);
                        }
                        return that.activeShapePoints;
                    }, false);
                    that.activeShape = that.drawShape(dynamicPositions);
                }
                that.activeShapePoints.push(earthPosition);
                that.activePoints.push(that.createPoint(earthPosition));
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(function (event) {
            if (Cesium.defined(that.floatingPoint)) {
                var newPosition = viewer.scene.pickPosition(event.endPosition);
                if (Cesium.defined(newPosition)) {
                    that.floatingPoint.position.setValue(newPosition);
                    that.activeShapePoints.pop();
                    that.activeShapePoints.push(newPosition);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


        this.handler.setInputAction(function (event) {
            that.terminateShape();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);




    }

    /**
     * 反激活
     */
    deactive() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        //清除掉相关资源
        viewer.entities.remove(this.floatingPoint);
        viewer.entities.remove(this.activeShape);
        for (let index = 0; index < this.activePoints.length; index++) {
            const element = this.activePoints[index];
            viewer.entities.remove(element);
        }
        //

    }

    //右键结束
    terminateShape() {
        this.activeShapePoints.pop();
        var obj = this.drawShape(this.activeShapePoints);
        viewer.entities.remove(this.floatingPoint);
        viewer.entities.remove(this.activeShape);
        var that = this;
        //有值的时候才返回
        if (this.drawcomplete && this.activeShapePoints) {
            try {
                //多边形的点返回额外的起点
                let returnpoints = this.activeShapePoints;
                let geojson = undefined;
                if (this.drawingMode == "polygon") {
                    returnpoints = [].concat(this.activeShapePoints);
                    returnpoints.push(this.activeShapePoints[0]);
                    //转换成经纬度然后构造geojson
                    let coords = returnpoints.map(p => { return that.projectto(p) });
                    //给予一个随机guid作为名称，用于检索
                    geojson = turf.polygon([coords], { name: GUID() });
                }
                //转换成
                this.drawcomplete({
                    id: obj,
                    pos: returnpoints,
                    geojson: geojson
                })
            } catch (error) {
                console.log(error);
            }
        }
        if (this.isclearwhencomplete) {
            viewer.entities.remove(obj);
            for (let index = 0; index < this.activePoints.length; index++) {
                const element = this.activePoints[index];
                viewer.entities.remove(element);
            }
        }
        this.floatingPoint = undefined;
        this.activeShape = undefined;
        this.activeShapePoints = [];
        this.activePoints = [];

    }

    drawShape(positionData) {
        var shape;
        if (this.drawingMode === "line") {
            shape = viewer.entities.add({
                polyline: {
                    positions: positionData,
                    clampToGround: false,
                    width: 3,
                },
            });
        } else if (this.drawingMode === "polygon") {
            shape = viewer.entities.add({
                polygon: {
                    hierarchy: positionData,
                    material: new Cesium.ColorMaterialProperty(
                        Cesium.Color.ORANGERED.withAlpha(0.5)
                    ),
                    // clampToGround: this.clampToGround,此后的api将没有clamptogroup参数，使用perposition决定是否贴地
                    perPositionHeight: !this.clampToGround,
                },
            });
        }
        return shape;
    }

    //创建点
    createPoint(worldPosition) {
        var point = viewer.entities.add({
            position: worldPosition,
            point: {
                color: Cesium.Color.RED,
                pixelSize: 5,
                heightReference: Cesium.HeightReference.NONE,
            },
        });
        return point;
    }
}



