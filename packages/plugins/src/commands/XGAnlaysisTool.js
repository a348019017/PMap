
/**
 * 限高分析包装类，使用classifyprimitive实现
 */
export class XGAnlaysisTool {
  constructor(option, tileset) {
    //右键结束绘制，返回全部的点geojson 
    this.tileset = tileset;
    this._minheight = 0;
    this._maxheight = 100;
  }

  //显示横截面
  set showPolygon(value) {}



  geojson2PolygonHierarchy(coordinates){
    let is3d = coordinates[0][0].length === 3;
    let resultCat = coordinates[0].flat();
    let pos = [];
    if (is3d) {
      pos = Cesium.Cartesian3.fromDegreesArrayHeights(resultCat);
    } else {
      pos = Cesium.Cartesian3.fromDegreesArray(resultCat);
    }    
    var newhierarchy = new Cesium.PolygonHierarchy(pos);
    return newhierarchy;
  }

  //涉及当前的地块区域
  //额外计算一个中心点出来，误差都很小，可以取第一个坐标的值，大面积不得行，如果是geojson
  set Polygon(geojson) {
    if(!geojson)
       return
    let type=geojson.type;
    let hierarchy=undefined;
    //这里不支持MultiplePOLYGON
    if (type == "Polygon") {
        hierarchy = this.geojson2PolygonHierarchy(geojson.coordinates);
    } else if (type == "MultiPolygon") {
        hierarchy = this.geojson2PolygonHierarchy(geojson.coordinates[0]);
    }
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    var polygonInstance = new Cesium.GeometryInstance({
      id: 1,
      geometry: Cesium.PolygonGeometry.fromPositions({
        positions: hierarchy.positions,
        height: 0,
        extrudedHeight: 200,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      }),

      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5)
        ),
      },
    });

    this.polygonPrimitive = new Cesium.ClassificationPrimitive({
      geometryInstances: [polygonInstance],
      classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
      asynchronous: true,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        translucent: true,
      }),
    });

    this.centerWC = Cesium.BoundingSphere.fromPoints(hierarchy.positions).center;
    this.center = Cesium.Cartographic.fromCartesian(this.centerWC);
    let that=this;
    this.polygonPrimitive.readyPromise.then(d=>{
      if(that.ready){
        that.ready();
      }
    })
    this.polygonPrimitive.show = true;

    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }

    this.polygoncutEnty = viewer.entities.add({
      name: "Red polygon on surface",
      polygon: {
        hierarchy: hierarchy,
        material: Cesium.Color.RED,
        height:0,
        material: Cesium.Color.CYAN.withAlpha(0.5),
        outline: true,
        extrudedHeight: 100,
        heightReference : Cesium.HeightReference.NONE,
        extrudedHeightReference:Cesium.HeightReference.NONE,
        outlineColor: Cesium.Color.BLACK,
      },
    });

    viewer.scene.primitives.add(this.polygonPrimitive);
  }


  

  //通过geojson构造polygon对象
  set PolygonGeoJSON(geojson) {}

  //设置限高的值
  set Height(value) {
    if (this.polygonPrimitive._primitive) {
      this.scaleHeight(value);
    }
  }

  scaleHeight(value) {
    //不方便直接修改primitive的原始坐标，可采用修改modelMatrix的方式进行动态抬升,
    let m = Cesium.Transforms.eastNorthUpToFixedFrame(this.centerWC);
    let inverse = Cesium.Matrix4.inverse(m, new Cesium.Matrix4());

    let offsetHeight = value - this.center.height;

    let mtranslation = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0.0, 0.0, offsetHeight)
    );
    let tt = Cesium.Matrix4.multiply(
      mtranslation,
      inverse,
      new Cesium.Matrix4()
    );
    this.polygonPrimitive._primitive.modelMatrix = Cesium.Matrix4.multiply(
      m,
      tt,
      new Cesium.Matrix4()
    );

    if (this.polygoncutEnty) {
      this.polygoncutEnty.polygon.extrudedHeight=value;
    }
  }


  clear(){
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }
  }


  //释放和清理相关资源
  destory() {
    //构造一个polygon
    if (this.polygonPrimitive) {
      viewer.scene.primitives.remove(this.polygonPrimitive);
    }
    //同时创建一个多边形的面用于展示切面，这里也采用primitive通过修改matrix的方式渲染
    if (this.polygoncutEnty) {
      viewer.entities.remove(this.polygoncutEnty);
    }
  }
}
