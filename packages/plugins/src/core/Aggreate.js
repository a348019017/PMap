/*
 * @$START: =================
 * @Author: WQF
 * @Date: 2023-01-11 15:02:31
 * @company:
 * @LastEditors: WQF
 * @LastEditTime: 2023-01-11 18:17:03
 * @Description:
 * @$END: ===================
 */

/**
 * @description: 点聚合功能效果
 * @param {*} viewer
 * @return {*}
 */

import ge from "../assets/imgs/ge.png"; //绿
import shi from "../assets/imgs/shi.png"; //橙
import bai from "../assets/imgs/bai.png"; //红

export default {
  data: {
    image: {
      ge: ge,
      shi: shi,
      bai: bai,
    },
  },
  initCluster(viewer, dataSource2) {
    viewer.dataSources._dataSources.forEach((dataSource) => {
      // 设置聚合参数
      dataSource.clustering.enabled = true;
      dataSource.clustering.pixelRange = 60;
      dataSource.clustering.minimumClusterSize = 1;
      console.log(dataSource.entities._entities);
      //  if(dataSource.entities._entities.length>0) {

      let _self = this;
      // 添加监听函数
      dataSource.clustering.clusterEvent.addEventListener(function (
        clusteredEntities,
        cluster
      ) {
        console.log(111);
        // 关闭自带的显示聚合数量的标签
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

        // 根据聚合数量的多少设置不同层级的图片以及大小
        if (clusteredEntities.length >= 100) {
          cluster.billboard.image = _self.combineIconAndLabel(
            clusteredEntities.length,
            64
          );
          cluster.billboard.width = 64;
          cluster.billboard.height = 64;
        }
        // 根据聚合数量的多少设置不同层级的图片以及大小
        else if (clusteredEntities.length >= 10) {
          cluster.billboard.image = _self.combineIconAndLabel(
            clusteredEntities.length,
            56
          );
          cluster.billboard.width = 56;
          cluster.billboard.height = 56;
        } else if (clusteredEntities.length >= 1) {
          cluster.billboard.image = _self.combineIconAndLabel(
            clusteredEntities.length,
            48
          );
          cluster.billboard.width = 48;
          cluster.billboard.height = 48;
        }

        // else if(clusteredEntities.length>1){
        //   cluster.billboard.image = _self.combineIconAndLabel(clusteredEntities.length, 44);
        //   cluster.billboard.width = 44;
        //   cluster.billboard.height = 44;
        // }
        // else if(clusteredEntities.length==1){
        //   cluster.billboard.image = _self.combineIconAndLabel(clusteredEntities.length, 44);
        //   cluster.billboard.width = 44;
        //   cluster.billboard.height = 44;
        // }
      });
      // }
    });
  },

  /**
   * @description: 将图片和文字合成新图标使用（参考Cesium源码）
   * @param {*} url：图片地址
   * @param {*} label：文字
   * @param {*} size：画布大小
   * @return {*} 返回canvas
   */
  combineIconAndLabel(label, size) {
    // 创建画布对象
    let canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d");
    let cirpng =
      Number(label) >= 100
        ? this.data.image["bai"]
        : Number(label) >= 10
        ? this.data.image["shi"]
        : this.data.image["ge"];

    let promise = new Cesium.Resource.fetchImage(cirpng).then((image) => {
      // 异常判断
      try {
        ctx.drawImage(image, 0, 0, size, size);
      } catch (e) {
        console.log(e);
      }

      // 渲染字体
      // font属性设置顺序：font-style, font-variant, font-weight, font-size, line-height, font-family
      ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
      ctx.font = "bold 20px Microsoft YaHei";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, size / 2, size / 2);

      return canvas;
    });
    return promise;
    // 异常判断
    // let imageIcon = new Image();
    // imageIcon.src = cirpng;
    // try {
    //      ctx.drawImage(imageIcon, 0, 0,size,size);
    // } catch (e) {
    //         console.log(e);
    // }
    // // 渲染字体
    // ctx.fillStyle = Cesium.Color.WHITE.toCssColorString();
    // ctx.font = 'bold 20px Microsoft YaHei';
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillText(label, size / 2, size / 2);

    // return canvas;
  },
  disableAggreate(viewer, datasource2) {
    viewer.dataSources._dataSources.forEach((dataSource) => {
      dataSource.clustering.enabled = false;
    });
  },
};
