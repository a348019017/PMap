<script>

import {CesiumShutter} from "@pmap-cesium/plugins"

export default {
    mounted(){
        this.slider=new CesiumShutter();
    }
}
</script>

<template>
    <div id="slid"></div>
</template>
