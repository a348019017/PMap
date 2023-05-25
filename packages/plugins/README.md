# pmap-plugins
 <a href="">
    <img src="https://img.shields.io/npm/v/pmap-cesium.svg">
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

````````````````````````````````````

## ChangeLog
1.0.0 更新三个插件类

1.0.1 更新CesiumController 模型编辑

1.0.2 TRAnlaysisTool 退让分析 XGAnlaysisTool 限高分析

1.0.3 CesiumDrawTool  CesiumLabelEditor 


## Contents

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








