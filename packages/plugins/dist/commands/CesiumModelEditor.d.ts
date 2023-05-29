/**
 * 模型编辑工具，点击模型高亮并拖拽，同时支持gltf和3dtile,这里支持Enitity加载的model，modelprimitive，以及3dtileset的也需要支持
 */
export class CesiumModelEditor {
    constructor(_callback: any, option: any);
    _callback: any;
    handler: any;
    scene: any;
    includeObjects: any;
    offsetHeight: number;
    isEditTilesetFeature: boolean;
    set IncludeObjects(arg: any);
    /**
     * 设置偏移的高度
     */
    set OffsetHeight(arg: any);
    active(): void;
    deactive(): void;
    destory(): void;
}
//# sourceMappingURL=CesiumModelEditor.d.ts.map