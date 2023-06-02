import { jsonToCesiumObject } from "../util/util";


/**
 * 预定义的图层枚举
 * 其它图层可自行定义在配置文件中
 */
export let preDefineTMSUrl = {
    GaoDeDom:{
      name: "gaodedom",
      title: "高德影像",
      url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      minimumLevel: 3,
      //这里需要设置原始瓦片所能支持的最高级别
      maximumLevel: 16,
      value: false,
      type: "ImageryProvider",
    },
    GaoDeMap:{
      name: "gaodemap",
      title: "高德地图",
      url: "http://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=2&scale=1&style=8",
      minimumLevel: 3,
      maximumLevel: 21,
      value: false,
      type: "ImageryProvider",
    },
    GaoDeDomX:{
      name: "gaodemapx",
      title: "高德影像纠偏",
      style: "img", // style: img、elec、cva
      crs: "WGS84", // 使用84坐标系，默认为：GCJ02
      minimumLevel: 3,
      maximumLevel: 18,
      value: false,
      type: "AmapImageryProvider",
    },
    GaoDeMap:{
      name: "gaodemapimgx",
      title: "高德地图纠偏",
      style: "elec", // style: img、elec、cva
      crs: "WGS84", // 使用84坐标系，默认为：GCJ02
      minimumLevel: 3,
      maximumLevel: 18,
      value: false,
      type: "AmapImageryProvider",
    },
    GoogleDom:{
      name: "google影像",
      title: "谷歌影像",
      url: "https://crack.jyaitech.com/gis/getmap?x={x}&y={y}&z={z}",
      minimumLevel: 3,
      maximumLevel: 21,
      value: true,
    },
    MapBoxMap:{
      url: 'https://api.mapbox.com/styles/v1',
      name: "mapboxdark",
      title: "mapboxdark",
      username: "pongxie",
      styleId: "cl7e5zmmk000m14pcp3zypbo7",
      accessToken:
        "pk.eyJ1IjoicG9uZ3hpZSIsImEiOiJjbDVrdmtndHowZHY3M2pxcjdrZzZsZTVoIn0.3PpdH5rSURGGtrfp90iIOw",
      minimumLevel: 3,
      maximumLevel: 21,
      value: true,
      type: "MapboxStyleImageryProvider",
    },
  };



/**
 * 处理影像的加载类，loader主要满足的数据的加载管理，面向图层，统一接口,数据驱动，没有中间包装的对象
 */
export class DomLoader
{
     load(cfg)
     {
          
     }
      
     remove(id){

     }
}
