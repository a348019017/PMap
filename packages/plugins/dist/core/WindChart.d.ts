/**
 * 风场效果，采用canvas绘制，并未采用webgl进行渲染,未作测试，参考使用
 *
 *
 */
export class WindChart {
    /**
     *
     * @param {*} isdistory  是否销毁
     * @param {*} json       风场数据
     * @param {Object} params
     * @param {viewer} params.viewer   Cesium.Viewer
     * @param {canvas} params.canvas
     * @param {Array} params.extent    [110,120,30,36] 顺序：west/east/south/north
     * @param {Number} params.canvasWidth   300
     * @param {Number} params.canvasHeight    100
     * @param {Number} params.speedRate    100
     * @param {Number} params.particlesNumber    20000  初始粒子总数，根据实际需要进行调节
     * @param {Number} params.maxAge   每个粒子的最大生存周期 128
     * @param {Number} params.frameRate   每个粒子的最大生存周期 128
     * @param {Number} params.lineWidth   1 线宽，像素单位
     * @param {Number} params.color   "#ffffff"
     * @constructor
     */
    constructor(isdistory: any, json: any, params: {
        viewer: viewer;
        canvas: canvas;
        extent: any[];
        canvasWidth: number;
        canvasHeight: number;
        speedRate: number;
        particlesNumber: number;
        maxAge: number;
        frameRate: number;
        lineWidth: number;
        color: number;
    });
    isdistory: any;
    windData: any;
    viewer: any;
    canvas: any;
    extent: any[] | undefined;
    canvasContext: any;
    canvasWidth: number | undefined;
    canvasHeight: number | undefined;
    speedRate: number | undefined;
    particlesNumber: number | undefined;
    maxAge: number | undefined;
    frameTime: number | undefined;
    color: string | number | undefined;
    lineWidth: number | undefined;
    initExtent: any[] | undefined;
    calc_speedRate: number[] | undefined;
    windField: CanvasWindField | null;
    particles: any[] | undefined;
    animateFrame: any;
    _init(): void;
    _calcStep(): void;
    redraw(): void;
    createField(): CanvasWindField;
    animate(): void;
    isInExtent(lng: any, lat: any): boolean;
    _resize(width: any, height: any): void;
    _parseWindJson(): {
        header: null;
        uComponent: null;
        vComponent: null;
    };
    /**
     *
     * @param {*} pid cesium所在div的上级节点
     */
    removeLines(pid: any): void;
    _tomap(lng: any, lat: any, particle: any): any[] | null;
    _togrid(lng: any, lat: any, particle: any): any[];
    _drawLines(lng: any, lat: any, particle: any): void;
    fRandomByfloat(under: any, over: any): any;
    fRandomBy(under: any, over: any, ...args: any[]): number;
    randomParticle(particle: any): any;
}
export class CanvasWindField {
    constructor(obj: any);
    west: number | null;
    east: number | null;
    south: number | null;
    north: number | null;
    rows: number | null;
    cols: number | null;
    dx: number | null;
    dy: number | null;
    unit: any;
    date: any;
    grid: any[] | null;
    _init(obj: any): void;
    _calcUV(u: any, v: any): number[];
    _bilinearInterpolation(x: any, y: any, g00: any, g10: any, g01: any, g11: any): number[];
    getIn(x: any, y: any): any;
    isInBound(x: any, y: any): boolean;
}
export class CanvasParticle {
    lng: any;
    lat: any;
    x: any;
    y: any;
    tlng: any;
    tlat: any;
    age: any;
    speed: any;
}
//# sourceMappingURL=WindChart.d.ts.map