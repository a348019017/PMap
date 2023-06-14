export namespace preDefineImagery {
    namespace GaoDeDom {
        const name: string;
        const title: string;
        const url: string;
        const minimumLevel: number;
        const maximumLevel: number;
        const value: boolean;
    }
    namespace GaoDeMap {
        const name_1: string;
        export { name_1 as name };
        const title_1: string;
        export { title_1 as title };
        export const style: string;
        export const crs: string;
        const minimumLevel_1: number;
        export { minimumLevel_1 as minimumLevel };
        const maximumLevel_1: number;
        export { maximumLevel_1 as maximumLevel };
        const value_1: boolean;
        export { value_1 as value };
        export const type: string;
    }
    namespace GaoDeDomX {
        const name_2: string;
        export { name_2 as name };
        const title_2: string;
        export { title_2 as title };
        const style_1: string;
        export { style_1 as style };
        const crs_1: string;
        export { crs_1 as crs };
        const minimumLevel_2: number;
        export { minimumLevel_2 as minimumLevel };
        const maximumLevel_2: number;
        export { maximumLevel_2 as maximumLevel };
        const value_2: boolean;
        export { value_2 as value };
        const type_1: string;
        export { type_1 as type };
    }
    namespace GoogleDom {
        const name_3: string;
        export { name_3 as name };
        const title_3: string;
        export { title_3 as title };
        const url_1: string;
        export { url_1 as url };
        const minimumLevel_3: number;
        export { minimumLevel_3 as minimumLevel };
        const maximumLevel_3: number;
        export { maximumLevel_3 as maximumLevel };
        const value_3: boolean;
        export { value_3 as value };
    }
    namespace MapBoxMap {
        const url_2: string;
        export { url_2 as url };
        const name_4: string;
        export { name_4 as name };
        const title_4: string;
        export { title_4 as title };
        export const username: string;
        export const styleId: string;
        export const accessToken: string;
        const minimumLevel_4: number;
        export { minimumLevel_4 as minimumLevel };
        const maximumLevel_4: number;
        export { maximumLevel_4 as maximumLevel };
        const value_4: boolean;
        export { value_4 as value };
        const type_2: string;
        export { type_2 as type };
    }
}
/**
 * 处理影像的加载类，loader主要满足的数据的加载管理，面向图层，统一接口,数据驱动，没有中间包装的对象
 */
export class DomLoader {
    parseJsonToImageProvider(j: any): any;
    /**
     *
     * @param {viewer} viewer
     * @param {object} j 传入影像图层配置文件,一律通过配置文件进行加载
     * @returns Cesium.ImageryLayer
     */
    addImagelayer(viewer: any, j: object): any;
    removeImagelayer(viewer: any, j: any): void;
}
//# sourceMappingURL=domLoader.d.ts.map