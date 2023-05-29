


/**
 * 通过参数构造一个模型Entity，使得其能够实时运动，考虑贴地
 * 1 构造后调用addTrackPoint实时添加点位
 * 2 实时跟踪车辆运行轨迹时场景下可用
 * 3 可自行添加设置历史轨迹，播放，暂停等方法
 * 4 比setinterval方法更流畅精确，直接使用cesium内部时间戳
 */
export class AnimationEntity {
  /**
   * 构造函数
   *
   * @param {Object} [options] An object with the following properties:
   * @param {Cartisian3} [options.initPosition=undefined] Whether or not to enable clustering.
   * @param {Number} [options.dateTime=20] 时间差，预留缓存时间差，单位s
   * @param {Number} [options.properties={}] 可选模型的属性信息
   * @param {Boolean} [options.modelurl=""] gltf模型地址
   *
   * @alias AnimationEntity
   * @constructor
   */
  constructor(option) {
    //记录最新的轨迹点
    this.latestPosition = option.initPosition;
    //默认时间差是10s这个取决于数据到来的差值，如果系统灵敏度高，这个值可以适当减少
    this.offsettime = option.offsettime || 20;
    //设定初始时间
    this.initDatetime = option.dateTime || Cesium.JulianDate.now();
    this.entyproperties = option.properties || {};
    //添加点的同时修改当前场景时间戳延后数秒，达到真实的时间段。
    let modelurl = option.modelurl || "static/models/car2.glb";
    let that = this;
    this.realproperty = new Cesium.SampledPositionProperty();
    this.realproperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    this.realproperty.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    let start = Cesium.JulianDate.addSeconds(
      this.initDatetime,
      -this.offsettime,
      new Cesium.JulianDate()
    );
    if (this.latestPosition) {
      //this.realproperty.addSample(start, this.latestPosition);
      this.realproperty.addSample(this.initDatetime, this.latestPosition);
    }
    //设置模型在地形上的贴地效果
    this.realproperty.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
    });

    //这里有个偏移量，原因在于模型参考系，这里需要重构下

    let carorientationsproperty = new Cesium.VelocityOrientationProperty(
      this.realproperty
    );

    let dd = carorientationsproperty.getValue.bind(carorientationsproperty);
    carorientationsproperty.getValue = function (time, result) {
      let quad = dd(time, result);
      if (!quad) return quad;
      let mat3 = Cesium.Matrix3.fromQuaternion(quad);
      //
      let offsettranslationmat3 = Cesium.Matrix3.fromRotationZ(3.14);
      let rotationScratch = Cesium.Matrix3.multiply(
        mat3,
        offsettranslationmat3,
        new Cesium.Matrix3()
      );
      return Cesium.Quaternion.fromRotationMatrix(rotationScratch, result);
    };
    //记录前一个轨迹点
    //this.prePosition = undefined;
    this.enty = viewer.entities.add({
      //这里id也使用name，方便检索
      id: "tempcar",
      name: "testcar",
      position: this.realproperty,
      properties: this.entyproperties,
      orientation: carorientationsproperty,
      model: {
        upAxis: Cesium.Axis.Y,
        uri: modelurl,
        minimumPixelSize: 128,
        maximumScale: 200,
        scale: 1.0,
        silhouetteSize: 2,
        heightReference: 1,
      },
      path: {
        show: true,
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.PINK,
        }),
        trailTime: 60,
        width: 5,
      },
    });

    //回溯系统时间到offset之前

    viewer.clock.startTime = start; //将多个点的第一个点设为轨迹播放的开始时间
    viewer.clock.currentTime = start; //修改时间轴的当前时间
    viewer.clock.shouldAnimate = true; //开始播放
    this.enty.addTrackPoint = this.addTrackPoint.bind(this);
    return this.enty;
  }

  /**
   * 动态新增轨迹点
   * @param {*} point
   * @param {*} datetime
   */
  addTrackPoint(point, datetime) {
    if (point && datetime) {
      this.realproperty.addSample(datetime, point);
    }
  }

  /**
   * 销毁对象
   */
  destory() {
    viewer.entities.remove(this.enty);
    //回归系统的正常时间，暂不考虑
  }
}
