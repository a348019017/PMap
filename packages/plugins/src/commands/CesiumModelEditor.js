/**
 * 模型编辑工具，点击模型高亮并拖拽，同时支持gltf和3dtile,这里支持Enitity加载的model，modelprimitive，以及3dtileset的也需要支持
 */
export class CesiumModelEditor {
  constructor(_callback, option) {

    
    option=option||{};
    //this._editorEntities=option.entities;
    this._callback=_callback;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
    this.scene = viewer.scene;
    //需要锁定待编辑的对象，可以是enty或者其它,不能任意编辑
    this.includeObjects=option.includeObjects||[];
    this.offsetHeight=0;
    //非单体化数据直接编辑全部
    this.isEditTilesetFeature=false;
  }

  set IncludeObjects(value){
    this.includeObjects=value||this.includeObjects;
  }
  /**
   * 设置偏移的高度
   */
  set OffsetHeight(value){
    this.offsetHeight=value;
  }

  //需要测试对ModelPrimitive的支持
  active() {

    let that = this;
    let dragging=false;
    let pickedEntity=undefined;
    //viewer.scene.globe.depthTestAgainstTerrain = true;

    this.handler.setInputAction(function (click) {
        
        var pickedObject = that.scene.pick(click.position);
        let findedObject = that.includeObjects.find(
          (i) => i == pickedObject.primitive || pickedObject.id == i
        );
        if (!findedObject) return;
        if (Cesium.defined(pickedObject) && pickedObject.primitive) {

          dragging = true;
          pickedEntity = pickedObject.id || pickedObject.primitive;
          viewer.scene.screenSpaceCameraController.enableRotate = false;

          //记录已有的坐标点
          if(pickedObject.primitive instanceof Cesium.Model || pickedObject.primitive instanceof Cesium.ModelExperimental)
          {
            if (pickedObject.id && pickedObject.id.model) {
              pickedObject.id.model.silhouetteSize = 5.0;
              that.offsetHeight=pickedEntity.position._value;
              that.offsetHeight=Cesium.Cartographic.fromCartesian(that.offsetHeight).height;
            } else {
              pickedObject.primitive.silhouetteSize = 5.0;

              that.offsetHeight=Cesium.Matrix4.getTranslation(pickedObject.primitive.modelMatrix,new Cesium.Cartesian3());
              that.offsetHeight=Cesium.Cartographic.fromCartesian(that.offsetHeight).height;
            }
            
          }else if(pickedObject.primitive instanceof Cesium.Cesium3DTileFeature){
            //高亮3dtileset 
            let cc = pickedObject.primitive.tileset;
            const style = new Cesium.Cesium3DTileStyle();
            // Override color expression with a custom function
            style.color = {
              evaluateColor: function (feature, result) {
                return Cesium.Color.clone(Cesium.Color.RED, result);
              },
            };
            //控制其样式全部为红色
            cc.style=style;

            //仅仅控制其transform，当包含matrix时不考虑其操作，3dtileset的组织并不能很好的统一
            that.offsetHeight=Cesium.Matrix4.getTranslation(cc.root.transform,new Cesium.Cartesian3());
            that.offsetHeight=Cesium.Cartographic.fromCartesian(that.offsetHeight).height;

          }
        } 
      
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    //拖拽是自由移动，选取地形的高度，按当前高度差赋值或固定
    this.handler.setInputAction(function (movement) {
      if (dragging&&pickedEntity) {
        //屏幕坐标转经纬度
        //排除掉当前图层
         var newCartesian = viewer.scene.pickPosition(movement.endPosition);
         //
         newCartesian=Cesium.Cartographic.fromCartesian(newCartesian);
         newCartesian.height=that.offsetHeight;
         newCartesian=Cesium.Cartographic.toCartesian(newCartesian);
         //newCartesian=viewer.scene.sampleHeight(newCartesian,[pickedEntity]);
        if (newCartesian) {
          if (pickedEntity instanceof Cesium.Entity) {
            //可直接修改其position，position会最终改动到3dtilePrimitive
            pickedEntity.position.setValue(newCartesian);
          } else if (
            pickedEntity instanceof Cesium.Model ||
            pickedEntity instanceof Cesium.ModelExperimental
          ) {
            //设置其变换矩阵，默认情况下并不好处理，主要原因是orientation并不好确定，小范围移动保持其旋转的姿态
            // let rotation= Cesium.Matrix4.getRotation(pickedEntity.modelMatrix,new Cesium.Matrix3());
            // let scale=Cesium.Matrix4.getRotation(pickedEntity.modelMatrix,new Cesium.Cartesian3());
            let newMatrix = Cesium.Matrix4.setTranslation(
              pickedEntity.modelMatrix,
              newCartesian,
              new Cesium.Matrix4()
            );
            pickedEntity.modelMatrix = newMatrix;
          } else if (pickedEntity instanceof Cesium.Cesium3DTileFeature) {
            let newMatrix = Cesium.Matrix4.setTranslation(
              pickedEntity.tileset.root.transform,
              newCartesian,
              new Cesium.Matrix4()
            );
            pickedEntity.tileset.root.transform = newMatrix;
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function (event) {
      if (pickedEntity && dragging) {
        dragging = false;
        
        if (pickedEntity instanceof Cesium.Entity) {
          pickedEntity.model.silhouetteSize = 0.0;
        } else if(pickedEntity instanceof Cesium.Model ||
          pickedEntity instanceof Cesium.ModelExperimental)  {
          pickedEntity.silhouetteSize = 0.0;
        }else if(pickedEntity instanceof Cesium.Cesium3DTileFeature){
          let cc = pickedObject.primitive.tileset;
          //取消其样式
          cc.style=undefined;
        }

        if (that._callback) {
          that._callback(pickedEntity);
        }
        pickedEntity=undefined;
        viewer.scene.screenSpaceCameraController.enableRotate  = true;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  deactive() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);

    
  }

  destory(){
    
  }
}



