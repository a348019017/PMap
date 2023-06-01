<script>
import {CesiumShutter} from "@pmap-cesium/plugins"

/**
 * VueCesium卷帘组件，可复写其样式进行扩展
 * #split {
    position: absolute;
    left: 50%;
    top: 0;
    background-color: red;
    width: 3px;
    height: 100%;
}
#split:hover {
    cursor: ew-resize;
}
 */
export default {
    name:"VueCesiumShutter",
    mounted(){
        this.slider=new CesiumShutter("split",{});
        this.slider.active();
    }
}
</script>

<template>
   <div id='split'></div>
</template>

<style lang="css" scoped>
#split {
    position: absolute;
    left: 50%;
    top: 0;
    background-color: red;
    width: 3px;
    height: 100%;
}
#split:hover {
    cursor: ew-resize;
}
</style>
