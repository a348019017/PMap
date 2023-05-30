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
    constructor(option: any);
    latestPosition: any;
    offsettime: any;
    initDatetime: any;
    entyproperties: any;
    realproperty: any;
    enty: any;
    /**
     * 动态新增轨迹点
     * @param {*} point
     * @param {*} datetime
     */
    addTrackPoint(point: any, datetime: any): void;
    /**
     * 销毁对象
     */
    destory(): void;
}
//# sourceMappingURL=AnimationEntity.d.ts.map