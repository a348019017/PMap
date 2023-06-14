# pmap-plugins
 <a href="">
    <img src="https://raster.shields.io/npm/v/@pmap-cesium/plugins">
  </a>
   <a href="">
    <img src="https://img.shields.io/npm/dm/@pmap-cesium/plugins">
  </a>


## 简介
Cesium的一些中低粒度常用封装类，如编辑模型等操作。一般不包含UI操作，需要UI部分请查看@pmap-cesium/vueCom的组件封装。本包不编译Cesium代码。
以求在Vue组件中尽可能减少CesiumAPI的调用。注意，Cesium的对象过于复杂，请勿在Vue中的data中定义Cesium对象。

[查看文档](https://a348019017.github.io/pmapdoc/).

## 安装
```````````````````````````````````
cnpm install @pmap-cesium/plugins --save
```````````````````````````````````

```````````````````````````````````

import {CesiumModelEditor} from "@pmap-cesium/plugins"

let editor=new CesiumModelEditor();
editor.active(); //激活功能
editor.deactive(); //反激活关闭功能
````````````````````````````````````

## ChangeLog
1.0.0 更新三个插件类

1.0.1 更新CesiumController 模型编辑

1.0.2 TRAnlaysisTool 退让分析 XGAnlaysisTool 限高分析

1.0.3 CesiumDrawTool  CesiumLabelEditor AnimationEntity

1.0.6 CesiumDrawCircleTool  CesiumDrawRectangleTool

1.0.7 Cesium.Measure  CesiumShutter

1.0.8 WindChart domLoader flatGeoBufferLoader

1.0.9 ModelLoader 

## Contents

* CesiumDrawTool

   绘制线面，矩形，圆形灯，考虑整合

* AnimationEntity

  历史轨迹，实时轨迹的动画效果封装类

* CesiumLabelEditor

  标注自由选取并拖动

* CesiumDrawTool

  绘制工具类

* CesiumPolygonEditor

  多边形编辑类

* [CesiumShutter]()

   卷帘基础封装暂不含UI

* [TranslationController](./public/readme/CesiumModelEditor.md)

  模型编辑类不含UI，带操作轴

* CesiumModelEditor

  模型编辑类，自由选取并拖动

* TRAnlaysisTool

  退让分析

* XGAnlaysisTool

  限高分析

* ModelSelectedCommand（byPolygon）
  
  模型选取高亮，适用于建筑底面方案，不适用单体化方案

* Cesium.Measure
  
  测量功能，封装面积，长度和三角测量，文件名称修改为


## 封装的要求

* 统一按功能封装成类

* 尽可能统一的通用接口调用名称

start()  stop()  End()  destory() active() deactive()  open() close() load()  unload() 等易于通用的接口名称

* 功能可能包含数据输入输出

统一规范输入，如矢量数据输入输出采用GeoJSON，同时也可输入输出Cesium的对象。

## 如何调试

下载代码，启动dev，主项目link到此项目，相当于启动两个项目进行调试. 这里的link详细用法为,当然可以尝试其他的link方式。
lerna有自己的link方式，在一个大包里面可以自动链接。

````````````
cnpm i npminstall -g

## link to global
npmlink

## use some link
npmlink some-lib
````````````













