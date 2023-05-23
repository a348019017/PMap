# pmap-rz
 <a href="">
    <img src="https://img.shields.io/npm/v/pmap-cesium.svg">
  </a>

## ChangeLog

1.0.10 重大更新，分析结果可进行保存，未全面测试，需要可回退之前版本.

1.0.11 重大更新，新增RZPrimitive类，处理贴地，贴模型的日照分析

1.0.13 处理凸多边形的ClipPlane，暂不支持保存和凹多边形裁切

1.0.14 日照分析渲染时renderstate depthmask=false，不讲此渲染的深度值写到缓冲里面去，防止冲突。使用原有的深度缓冲。


## 联系我
13247118869

## 简介

* pmap-rz
Cesium 日照分析sdk

### Class RZPrimitiveX
多边形范围内的日照分析，不支持建筑地形等表面。可采样globe地形的深度图不包含建筑实现一个贴地效果。其余机制均类似下者

### Class RZPrimitive
全屏日照（包含建筑模型和地表），通过多边形进行裁切，无法记录分析结果，暂只能实时计算。


## Demo（GIF）
 <a href="https://ponggis.xyz:8070/static/pmap-rz.gif">
   demo地址
 </a>
<img src="20230313113446.png">


## Example
```
let legends=[
        {
            name:"1",
            title:"小于1小时",
            color:"#f50205",
            min:0,
            max:1,
        }, {
            name:"2",
            color:"#f9a100",
            title:"1-2小时",
            min:1,
            max:2,
        },
        {
            name:"3",
            color:"#f5f701",
            title:"2-3小时",
            min:2,
            max:3,
        },
        {
            name:"4",
            color:"#a7f637",
            title:"3-4小时",
            min:2,
            max:3,
        },
        {
            name:"5",
            color:"#08f210",
            title:"4-5小时",
            min:2,
            max:3,
        },{
            name:"6",
            color:"#06f4f7",
            title:"5-6小时",
            min:2,
            max:3,
        },{
            name:"7",
            color:"#00baf6",
            title:"6-7小时",
            min:2,
            max:3,
        },{
            name:"8",
            color:"#0000f6",
            title:"7小时以上",
            min:2,
            max:3,
        }
    ];
this._rzprimitive = new pmap.RZPrimitiveX(viewer,{positions:hierarchy.positions,legends:this.legends,clampground:false,height:30});
viewer.scene.primitives.add(this._rzprimitive);
```


## Demo






