export default PrimitiveCluster;
export namespace PrimitiveCluster {
    /**
     * A event listener function used to style clusters.
     */
    type newClusterCallback = (clusteredEntities: Entity[], cluster: Object, billboard: any, label: any, point: any) => any;
}
/**
 * Defines how screen space objects (billboards, points, labels) are clustered.
 *
 * @param {Object} [options] An object with the following properties:
 * @param {Boolean} [options.enabled=false] Whether or not to enable clustering.
 * @param {Number} [options.pixelRange=80] The pixel range to extend the screen space bounding box.
 * @param {Number} [options.minimumClusterSize=2] The minimum number of screen space objects that can be clustered.
 * @param {Boolean} [options.clusterBillboards=true] Whether or not to cluster the billboards of an entity.
 * @param {Boolean} [options.clusterLabels=true] Whether or not to cluster the labels of an entity.
 * @param {Boolean} [options.clusterPoints=true] Whether or not to cluster the points of an entity.
 * @param {Boolean} [options.show=true] Determines if the entities in the cluster will be shown.
 *
 * @alias PrimitiveCluster
 * @constructor
 *
 * @demo {@link https://sandcastle.cesium.com/index.html?src=Clustering.html|Cesium Sandcastle Clustering Demo}
 */
declare function PrimitiveCluster(options?: {
    enabled?: boolean | undefined;
    pixelRange?: number | undefined;
    minimumClusterSize?: number | undefined;
    clusterBillboards?: boolean | undefined;
    clusterLabels?: boolean | undefined;
    clusterPoints?: boolean | undefined;
    show?: boolean | undefined;
} | undefined): void;
declare class PrimitiveCluster {
    /**
     * Defines how screen space objects (billboards, points, labels) are clustered.
     *
     * @param {Object} [options] An object with the following properties:
     * @param {Boolean} [options.enabled=false] Whether or not to enable clustering.
     * @param {Number} [options.pixelRange=80] The pixel range to extend the screen space bounding box.
     * @param {Number} [options.minimumClusterSize=2] The minimum number of screen space objects that can be clustered.
     * @param {Boolean} [options.clusterBillboards=true] Whether or not to cluster the billboards of an entity.
     * @param {Boolean} [options.clusterLabels=true] Whether or not to cluster the labels of an entity.
     * @param {Boolean} [options.clusterPoints=true] Whether or not to cluster the points of an entity.
     * @param {Boolean} [options.show=true] Determines if the entities in the cluster will be shown.
     *
     * @alias PrimitiveCluster
     * @constructor
     *
     * @demo {@link https://sandcastle.cesium.com/index.html?src=Clustering.html|Cesium Sandcastle Clustering Demo}
     */
    constructor(options?: {
        enabled?: boolean | undefined;
        pixelRange?: number | undefined;
        minimumClusterSize?: number | undefined;
        clusterBillboards?: boolean | undefined;
        clusterLabels?: boolean | undefined;
        clusterPoints?: boolean | undefined;
        show?: boolean | undefined;
    } | undefined);
    _enabled: any;
    _pixelRange: any;
    _minimumClusterSize: any;
    _clusterBillboards: any;
    _clusterLabels: any;
    _clusterPoints: any;
    _labelCollection: any;
    _billboardCollection: any;
    _pointCollection: any;
    _clusterBillboardCollection: any;
    _clusterLabelCollection: any;
    _clusterPointCollection: any;
    _collectionIndicesByEntity: {};
    _unusedLabelIndices: any[];
    _unusedBillboardIndices: any[];
    _unusedPointIndices: any[];
    _previousClusters: any[];
    _previousHeight: any;
    _enabledDirty: boolean;
    _clusterDirty: boolean;
    _cluster: ((amount: any) => void) | undefined;
    _removeEventListener: any;
    _clusterEvent: any;
    _delay: any;
    /**
     * Determines if entities in this collection will be shown.
     *
     * @type {Boolean}
     * @default true
     */
    show: boolean;
    _initialize(scene: any): void;
    _scene: any;
    /**
     * Returns a new {@link Label}.
     * @param {Entity} entity The entity that will use the returned {@link Label} for visualization.
     * @returns {Label} The label that will be used to visualize an entity.
     *
     * @private
     */
    private getLabel;
    private removeLabel;
    /**
     * Returns a new {@link Billboard}.
     * @param {Entity} entity The entity that will use the returned {@link Billboard} for visualization.
     * @returns {Billboard} The label that will be used to visualize an entity.
     *
     * @private
     */
    private getBillboard;
    private removeBillboard;
    /**
     * Returns a new {@link Point}.
     * @param {Entity} entity The entity that will use the returned {@link Point} for visualization.
     * @returns {Point} The label that will be used to visualize an entity.
     *
     * @private
     */
    private getPoint;
    private removePoint;
    private update;
    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <p>
     * Unlike other objects that use WebGL resources, this object can be reused. For example, if a data source is removed
     * from a data source collection and added to another.
     * </p>
     */
    destroy(): undefined;
    _pixelRangeDirty: boolean | undefined;
    _minimumClusterSizeDirty: boolean | undefined;
}
//# sourceMappingURL=primitivecluster.d.ts.map