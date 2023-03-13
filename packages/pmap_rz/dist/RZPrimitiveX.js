!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).pmap_rz={})}(this,(function(e){"use strict";function t(){const e=["ColorGeometryInstanceAttribute","fromColor","Primitive","VERTEX_FORMAT","7638890NhyFch","MultiPolygon","GeometryInstance","3378250kEpKoF","add","type","#ff0000","RED","498OeRDjC","1696044wCHHpG","CESIUM_3D_TILE","ClassificationPrimitive","withAlpha","ClassificationType","height","14925RZhCwB","maxdistance","fromCssColorString","EllipsoidSurfaceAppearance","Color","featureCollection","map","PolygonHierarchy","7376mmoXNs","229948wKsfKL","entities","flat","length","15507mZiydf","Cartesian3","coordinates","PolygonGeometry","fromDegreesArray","geometry","145CEyTEe","_polygonHierarchy","forEach","PerInstanceColorAppearance","858174zycGXL","Polygon"];return(t=function(){return e})()}function a(e,n){const i=t();return(a=function(e,t){return i[e-=354]})(e,n)}function n(e,t){var a=i();return(n=function(e,t){return a[e-=126]})(e,t)}function i(){var e=["#0000f6","src","parseInt","setAttribute","130459doAlkI","#f9a100","3790164GQeMyJ","4-5小时","小于1小时","getContext","style","body","none","click","wgs84ToWindowCoordinates","FRAMEBUFFER_COMPLETE","href","2482998IUNWgq","6-7小时","canvas","toCartesian","scene","5-6小时","data","#08f210","449435oCTfBy","download","appendChild","length","fillRect","2426742ljijZq","#06f4f7","width","_gl","map","fillStyle","createElement","15Pkwcrn","FRAMEBUFFER","2536572AOkYAU","set","14471505VmiIFp","beginPath","context","toDataURL","readPixels","checkFramebufferStatus","472xvPPjO","#f5f701","height"];return(i=function(){return e})()}function o(){const e=["    return normalize(","#ifndef LOG_DEPTH \n    return czm_windowToEyeCoordinates(gl_FragCoord); \n#else \n    return vec4(v_logPositionEC, 1.0); \n#endif \n","} \nvec3 getNormalEC() \n{ \n","_isPointLight","normalOffset","findNormalVarying","split","ENABLE_VERTEX_LIGHTING","3807684ytigNe","parseInt","    float maxDepth = shadowMap_cascadeSplits[1].w; \n    // Stop early if the eye depth exceeds the last cascade \n    if (depth > maxDepth) \n    { \n        return; \n    } \n    // Get the cascade based on the eye-space depth \n    vec4 weights = czm_cascadeWeights(depth); \n    // Apply normal offset \n    float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); \n    applyNormalOffset(positionEC, normalEC, nDotL); \n    // Transform position into the cascade \n    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; \n    // Get visibility \n    shadowParameters.texCoords = shadowPosition.xy; \n    shadowParameters.depth = shadowPosition.z; \n    shadowParameters.nDotL = nDotL; \n    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); \n    // Fade out shadows that are far away \n    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; \n    float fade = max((depth - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); \n    visibility = mix(visibility, 1.0, fade); \n","czm_shadow_receive_main","6478192UrzyNq","    shadowParameters.depthBias *= max(depth * 0.01, 1.0); \n","341649iiqAun","slice","_polygonOffsetSupported","2110PzZucK","replaceMain","length","void main() \n{ \n    czm_shadow_receive_main(); \n    vec4 positionEC = getPositionEC(); \n    vec3 normalEC = getNormalEC(); \n    float depth = -positionEC.z; \n","    shadowParameters.depthBias *= mix(1.0, 100.0, depth * 0.0015); \n","findPositionVarying","USE_NORMAL_SHADING","normalShadingSmooth","uniform samplerCube shadowMap_textureCube; \n","} \nvoid applyNormalOffset(inout vec4 positionEC, vec3 normalEC, float nDotL) \n{ \n","20035fzgjMY","SHADOW_MAP","push","USE_CUBE_MAP_SHADOW","createShadowReceiveFragmentShader","_terrainBias","GENERATE_POSITION_AND_NORMAL","sources","USE_SHADOW_DEPTH_TEXTURE","   \n      float rd=0.016667;\n      vec4 helsing_visibleAreaColor=vec4(1.0*rd,0.0,0.0,1.0);\n      vec4 helsing_unvisibleAreaColor=vec4(0.0,1.0*rd,0.0,1.0);\n      if(visibility>0.30){\n          gl_FragColor=vec4(helsing_visibleAreaColor.rgb,1.0);\n      }else\n      {\n          gl_FragColor=vec4(helsing_unvisibleAreaColor.rgb,1.0);;\n      }      \n      } \n    ","_pointBias","_numberOfCascades","ENABLE_DAYNIGHT_SHADING","USE_SOFT_SHADOWS","USE_NORMAL_SHADING_SMOOTH","132167msoDuo","    return vec4(","createShadowReceiveVertexShader",", 1.0); \n","    // Draw cascade colors for debugging \n    gl_FragColor *= czm_cascadeColor(weights); \n","); \n","defines","debugCascadeColors","    return vec3(1.0); \n","20RklDKB","defined","296nXTSJF","softShadows","ShaderSource","uniform sampler2D shadowMap_texture; \n","258KZwPFY","    float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); \n    applyNormalOffset(positionEC, normalEC, nDotL); \n    vec4 shadowPosition = shadowMap_matrix * positionEC; \n    // Stop early if the fragment is not in the shadow bounds \n    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n    { \n        return; \n    } \n    shadowParameters.texCoords = shadowPosition.xy; \n    shadowParameters.depth = shadowPosition.z; \n    shadowParameters.nDotL = nDotL; \n    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); \n","164978TdEOcp","    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz; \n    float distance = length(directionEC); \n    directionEC = normalize(directionEC); \n    float radius = shadowMap_lightPositionEC.w; \n    // Stop early if the fragment is beyond the point light radius \n    if (distance > radius) \n    { \n        return; \n    } \n    vec3 directionWC  = czm_inverseViewRotation * directionEC; \n    shadowParameters.depth = distance / radius; \n    shadowParameters.nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0); \n    shadowParameters.texCoords = directionWC; \n    float visibility = czm_shadowVisibility(shadowMap_textureCube, shadowParameters); \n","GENERATE_POSITION","_isSpotLight","   \n    \n            //gl_FragColor.rgb *= visibility;\n           // float rd=0.083333;\n            float rd=0.016667;\n            vec4 helsing_visibleAreaColor=vec4(1.0*rd,0.0,0.0,1.0);\n            vec4 helsing_unvisibleAreaColor=vec4(0.0,1.0*rd,0.0,1.0);\n            if(visibility>0.30){\n                gl_FragColor=vec4(helsing_visibleAreaColor.rgb,1.0);\n            }else\n            {\n                gl_FragColor=vec4(helsing_unvisibleAreaColor.rgb,1.0);;\n            }      \n        } \n      ","434745dYwBOh","_usesDepthTexture","_primitiveBias","    vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz); \n    float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0); \n    applyNormalOffset(positionEC, normalEC, nDotL); \n    vec4 shadowPosition = shadowMap_matrix * positionEC; \n    // Spot light uses a perspective projection, so perform the perspective divide \n    shadowPosition /= shadowPosition.w; \n    // Stop early if the fragment is not in the shadow bounds \n    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n    { \n        return; \n    } \n    shadowParameters.texCoords = shadowPosition.xy; \n    shadowParameters.depth = shadowPosition.z; \n    shadowParameters.nDotL = nDotL; \n    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); \n","uniform mat4 shadowMap_matrix; \nuniform vec3 shadowMap_lightDirectionEC; \nuniform vec4 shadowMap_lightPositionEC; \nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \n#ifdef LOG_DEPTH \nvarying vec3 v_logPositionEC; \n#endif \nvec4 getPositionEC() \n{ \n","normalShading","    float normalOffset = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.x; \n    float normalOffsetScale = 1.0 - nDotL; \n    vec3 offset = normalOffset * normalOffsetScale * normalEC; \n    positionEC.xyz += offset; \n","uniform mat4 shadowMap_matrix; \nuniform vec3 shadowMap_lightDirectionEC; \nuniform vec4 shadowMap_lightPositionEC; \nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \n#ifdef LOG_DEPTH \nin vec3 v_logPositionEC; \n#endif \nvec4 getPositionEC() \n{ \n"];return(o=function(){return e})()}!function(e,t){const n=a,i=e();for(;;)try{if(844337===parseInt(n(371))/1+-parseInt(n(385))/2*(parseInt(n(392))/3)+-parseInt(n(357))/4*(-parseInt(n(367))/5)+-parseInt(n(386))/6+parseInt(n(377))/7+-parseInt(n(356))/8*(parseInt(n(361))/9)+parseInt(n(380))/10)break;i.push(i.shift())}catch(e){i.push(i.shift())}}(t),function(e,t){for(var a=n,i=e();;)try{if(771871===-parseInt(a(140))/1+-parseInt(a(154))/2+parseInt(a(145))/3+parseInt(a(171))/4+parseInt(a(152))/5*(parseInt(a(132))/6)+parseInt(a(169))/7*(parseInt(a(162))/8)+-parseInt(a(156))/9)break;i.push(i.shift())}catch(e){i.push(i.shift())}}(i);const s=r;function r(e,t){const a=o();return(r=function(e,t){return a[e-=437]})(e,t)}!function(e,t){const a=r,n=e();for(;;)try{if(729102===-parseInt(a(470))/1*(parseInt(a(479))/2)+parseInt(a(492))/3+-parseInt(a(508))/4+-parseInt(a(455))/5*(-parseInt(a(485))/6)+parseInt(a(440))/7+-parseInt(a(481))/8*(parseInt(a(442))/9)+-parseInt(a(445))/10*(-parseInt(a(487))/11))break;n.push(n.shift())}catch(e){n.push(n.shift())}}(o);const h=Cesium[s(483)],l=Cesium[s(480)],m=Cesium.ShadowMapShader;let d;function c(e){e?function(){const e=s,t=Number[e(437)](Cesium.VERSION[e(506)](".")[1])>=101;d=m[e(459)],t?(m[e(472)]=function(t,a,n){const i=e,o=t[i(476)][i(443)](0),s=t[i(462)].slice(0);return o.push(i(456)),a&&(n?o.push(i(461)):o[i(457)](i(489))),new h({defines:o,sources:s})},m.createShadowReceiveFragmentShader=function(t,a,n,i,o){const s=e,r=h[s(505)](t),m=!i&&l(r)||i&&o,d=h.findPositionVarying(t),c=l(d),p=a[s(493)],f=a[s(444)],u=a[s(503)],C=a[s(490)],w=a[s(466)]>1,_=a[s(477)],g=a[s(482)],v=u?a._pointBias:i?a[s(460)]:a[s(494)],y=t[s(476)][s(443)](0),E=t[s(462)][s(443)](0),P=E[s(447)];for(let e=0;e<P;++e)E[e]=h[s(446)](E[e],s(439));u?y[s(457)](s(458)):p&&y[s(457)](s(463)),g&&!u&&y[s(457)](s(468)),w&&n&&i&&(m?y[s(457)](s(507)):y[s(457)]("ENABLE_DAYNIGHT_SHADING")),n&&v[s(497)]&&m&&(y[s(457)](s(451)),v[s(452)]>0&&y[s(457)](s(469)));let S,x="";return x+=u?s(453):"uniform sampler2D shadowMap_texture; \n",S=c?s(471)+d+s(473):s(501),x+=s(499)+S+s(502)+(m?s(500)+r+s(475):s(478))+"} \nvoid applyNormalOffset(inout vec4 positionEC, vec3 normalEC, float nDotL) \n{ \n"+(v[s(504)]&&m?"    float normalOffset = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.x; \n    float normalOffsetScale = 1.0 - nDotL; \n    vec3 offset = normalOffset * normalOffsetScale * normalEC; \n    positionEC.xyz += offset; \n":"")+"} \n",x+=s(448),x+="    czm_shadowParameters shadowParameters; \n    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \n    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \n    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \n    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \n",i?x+=s(441):f||(x+="    shadowParameters.depthBias *= mix(1.0, 100.0, depth * 0.0015); \n"),x+=u?s(488):C?s(495):w?s(438)+(_?"    // Draw cascade colors for debugging \n    out_FragColor *= czm_cascadeColor(weights); \n":""):s(486),x+=s(491),E.push(x),new h({defines:y,sources:E})}):m.createShadowReceiveFragmentShader=function(t,a,n,i,o){const s=e,r=h[s(505)](t),m=!i&&l(r)||i&&o,d=h[s(450)](t),c=l(d),p=a._usesDepthTexture,f=a._polygonOffsetSupported,u=a[s(503)],C=a[s(490)],w=a[s(466)]>1,_=a[s(477)],g=a[s(482)],v=u?a[s(465)]:i?a._terrainBias:a[s(494)],y=t[s(476)][s(443)](0),E=t[s(462)][s(443)](0),P=E.length;for(let e=0;e<P;++e)E[e]=h[s(446)](E[e],s(439));u?y[s(457)]("USE_CUBE_MAP_SHADOW"):p&&y[s(457)](s(463)),g&&!u&&y[s(457)](s(468)),w&&n&&i&&(m?y[s(457)](s(507)):y[s(457)](s(467))),n&&v[s(497)]&&m&&(y[s(457)]("USE_NORMAL_SHADING"),v[s(452)]>0&&y[s(457)](s(469)));let S,x="";return x+=s(u?453:484),S=c?s(471)+d+", 1.0); \n":s(501),x+=s(496)+S+s(502)+(m?s(500)+r+s(475):s(478))+s(454)+(v[s(504)]&&m?s(498):"")+"} \n",x+=s(448),x+="    czm_shadowParameters shadowParameters; \n    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \n    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \n    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \n    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \n",i?x+=s(441):f||(x+=s(449)),x+=u?s(488):C?"    vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz); \n    float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0); \n    applyNormalOffset(positionEC, normalEC, nDotL); \n    vec4 shadowPosition = shadowMap_matrix * positionEC; \n    // Spot light uses a perspective projection, so perform the perspective divide \n    shadowPosition /= shadowPosition.w; \n    // Stop early if the fragment is not in the shadow bounds \n    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n    { \n        return; \n    } \n    shadowParameters.texCoords = shadowPosition.xy; \n    shadowParameters.depth = shadowPosition.z; \n    shadowParameters.nDotL = nDotL; \n    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); \n":w?"    float maxDepth = shadowMap_cascadeSplits[1].w; \n    // Stop early if the eye depth exceeds the last cascade \n    if (depth > maxDepth) \n    { \n        return; \n    } \n    // Get the cascade based on the eye-space depth \n    vec4 weights = czm_cascadeWeights(depth); \n    // Apply normal offset \n    float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); \n    applyNormalOffset(positionEC, normalEC, nDotL); \n    // Transform position into the cascade \n    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; \n    // Get visibility \n    shadowParameters.texCoords = shadowPosition.xy; \n    shadowParameters.depth = shadowPosition.z; \n    shadowParameters.nDotL = nDotL; \n    float visibility = czm_shadowVisibility(shadowMap_texture, shadowParameters); \n    // Fade out shadows that are far away \n    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; \n    float fade = max((depth - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); \n    visibility = mix(visibility, 1.0, fade); \n"+(_?s(474):""):s(486),x+=s(464),E[s(457)](x),new h({defines:y,sources:E})}}():m.createShadowReceiveFragmentShader=d}const p=f;function f(e,t){const a=u();return(f=function(e,t){return a[e-=288]})(e,t)}!function(e,t){const a=f,n=e();for(;;)try{if(919443===-parseInt(a(374))/1+parseInt(a(311))/2+-parseInt(a(384))/3*(parseInt(a(323))/4)+-parseInt(a(369))/5+parseInt(a(329))/6+parseInt(a(328))/7+parseInt(a(398))/8*(parseInt(a(305))/9))break;n.push(n.shift())}catch(e){n.push(n.shift())}}(u);function u(){const e=["_option","386571KQXiGP","push","width","_samplePoints","createFramebuffer","setHours","legend_0","#ffffff","RED","GeometryInstance","terrainProvider","Camera","normalize","show","138392MRXPCD","legends","DefaultImageId","visibleAreaColor","fromCartesian","_materialCache","Material","computeIcrfToFixedMatrix","JulianDate","color","DEPTH_STENCIL","secondsOfDay","sampleTerrainMostDetailed","framebuffer","context","ColorGeometryInstanceAttribute","_fb","_clearColorCommand","Primitive","Color","EllipsoidSurfaceAppearance","Pass","BlendingState","setSunAndMoonDirections","polygonprimitrive","fromCssColorString","receiveShadows","createReceiveDerivedCommand","Simon1994PlanetaryPositions","direction","PolygonGeometry","810RIpWue","receiveCommand","resolve","OPAQUE","position","_lightCamera","2316104woLvAS","_isready","primitives","vtxfTexture","time","multiplyByVector","ShadowMap","Transforms","destory","_legendimage","ClearCommand","alpha","40UHnUdi","invisibleAreaColor","Matrix3","GREEN","add","7414183xjbdKA","8770476zXKVTE","uniformMap","fromColor","equals","height","scene","clampground","Framebuffer","_sampleCallback","clone","camera","_shadowmap","fromDate","clear","Texture","Cartesian3","Renderbuffer","computeTemeToPseudoFixedMatrix","init","RZType","shadowMaps","_index","Cartographic","VERTEX_FORMAT","positions","TextureMinificationFilter","remove","defined","RenderbufferFormat","image_1","commandList","_isSampleDone","canvas","_starttime","_colorCommands","ADDITIVE_BLEND","map","then","_cameraPosition","renderState","7230945luuMmI","dirty","createShadowMaps","_extraCmds","_count","1581675IjaZKq","lightCamera","ALPHA_BLEND","createShadowMap","shadowMap","_colorTextures","RenderState","readyPromise","NEAREST"];return(u=function(){return e})()}Cesium[p(404)].RZType=p(348),Cesium.Material[p(403)].addMaterial(Cesium.Material.RZType,{fabric:{type:Cesium[p(404)].RZType,uniforms:{image:Cesium[p(404)][p(400)],legend:Cesium[p(404)][p(400)]},source:"\nuniform sampler2D image;\nuniform sampler2D legend;\n\nczm_material czm_getMaterial(czm_materialInput materialInput)\n{\n    czm_material material = czm_getDefaultMaterial(materialInput);\n    \n    vec2 UV = gl_FragCoord.xy/czm_viewport.zw;\n    //从屏幕取样\n    vec4 sampled = texture2D(image,UV).rgba;\n    //sampled.r=0.5;\n    vec4 dcolor= texture2D(legend, vec2(sampled.r,0.0));\n\n    material.alpha=1.0;\n    material.diffuse=dcolor.rgb;\n    return material;\n}\n\n"},translucent:function(e){return!0}});class C{constructor(e,t){const a=p;let n=this;if(this[a(383)]=t,this[a(387)]=t.samplePoints,this._sampleCallback=t.sampleCallback,this[a(360)]=!1,t[a(335)]){t[a(353)]=t[a(353)][a(365)]((e=>Cesium.Cartographic[a(402)](e)));const i=Cesium[a(410)](e[a(394)],t[a(353)]);Promise[a(307)](i)[a(366)]((function(i){const o=a;let s=-9999;i=i[o(365)]((e=>(e[o(333)]>s&&(s=e[o(333)]),Cesium.Cartographic.toCartesian(e)))),t[o(333)]=s,t[o(353)]=i,n[o(347)](e,t)}))}else n[a(347)](e,t)}[p(347)](e,t){const a=p;this[a(397)]=!0,this[a(409)]=0,this[a(320)]="";var i=e[a(334)][a(288)];if(t[a(399)]&&(this[a(320)]=function(e,t){var a=n;const i=16*e[a(143)];var o=document[a(151)](a(134));o[a(147)]=i,o[a(164)]=16;var s=o[a(174)]("2d");s[a(157)]();for(let t=0;t<e.length;t++){let n=e[t].color,i=16*t,o=0;s[a(150)]=n,s[a(144)](i,o,16,16)}var r=new Image;return r.src=o[a(159)](),r}(t.legends),this[a(314)]=new(Cesium[a(343)])({context:i,source:this[a(320)]})),this._cameraPosition=new Cesium.Cartesian3,t.positions){var o=new(Cesium[a(336)])({context:i,colorTextures:[new(Cesium[a(343)])({context:i,width:i[a(361)][a(386)],height:i[a(361)][a(333)]})],depthStencilRenderbuffer:new Cesium.Renderbuffer({context:i,width:i.canvas[a(386)],height:i[a(361)][a(333)],format:Cesium.RenderbufferFormat[a(408)]})});this[a(290)]=o;var s=new Cesium.PolygonHierarchy(t[a(353)]);let n=new(Cesium[a(304)])({polygonHierarchy:s,height:t.height,vertexFormat:Cesium[a(294)][a(352)]});var r=new(Cesium[a(393)])({geometry:n,attributes:{color:Cesium[a(289)][a(331)](Cesium[a(293)][a(299)](a(391)).withAlpha(0))}});let h=new(Cesium[a(292)])({geometryInstances:r,asynchronous:!1,appearance:new Cesium.EllipsoidSurfaceAppearance({material:new(Cesium[a(404)])({fabric:{type:a(348),uniforms:{legend:this[a(320)]}},minificationFilter:Cesium[a(354)][a(382)],magnificationFilter:Cesium.TextureMagnificationFilter[a(382)]})})});this[a(298)]=h;let l=new Date(Date.now());l[a(389)](17,0,0),this[a(350)]=0,this[a(373)]=60,l=Cesium[a(406)][a(341)](l),this[a(362)]=l;let m=this[a(297)]({time:l}),d=new(Cesium[a(317)])({context:e[a(334)][a(288)],lightCamera:m,enabled:!0});this[a(340)]=d,this[a(291)]=new(Cesium[a(321)])({color:new(Cesium[a(293)])(0,0,0,0),pass:Cesium[a(295)][a(308)],owner:this,framebuffer:this._fb}),this._isready=!1,Cesium[a(380)].fromCache({blending:Cesium[a(296)][a(376)]});let p=this;this[a(298)][a(381)].then((t=>{const n=a;c(!0);let i=t[n(363)],s=i.map((t=>{const a=n;t[a(300)]=!0;let i=Cesium[a(317)][a(301)]([p[a(340)]],t,!0,e.scene._context,{});i[a(306)][a(300)]=!1;const o=Cesium[a(338)](Cesium[a(296)][a(364)],!0),s=new Cesium.Color(0,0,0,0);return o[a(407)]=s,i[a(306)][a(368)].blending=o,i.receiveCommand.pass=7,i[a(306)][a(411)]=p._fb,i[a(306)]}));p._extraCmds=s,c(!1),p.polygonCmds=i[n(365)]((e=>{const t=n;let a=Cesium[t(338)](e);return a.uniformMap[t(358)]=function(){return o[t(379)][0]},a[t(330)][t(390)]=function(){return p[t(314)]},a})),p[n(298)][n(397)]=!1,p[n(312)]=!0})),e[a(334)][a(313)][a(327)](this.polygonprimitrive)}}[p(388)](){const e=p;var t=viewer[e(334)][e(288)];return new(Cesium[e(336)])({context:t,colorTextures:[new(Cesium[e(343)])({context:t,width:t.canvas[e(386)],height:t[e(361)].height})],depthStencilRenderbuffer:new(Cesium[e(345)])({context:t,width:t[e(361)][e(386)],height:t.canvas[e(333)],format:Cesium[e(357)].DEPTH_STENCIL})})}setSamplePoints(e){this._samplePoints=e,this._isSampleDone=!1}update(e){const t=p;if(this[t(397)]&&this[t(312)]&&Cesium.defined(this[t(372)]))if(e[t(339)][t(309)][t(332)](this._cameraPosition)||(this[t(350)]=0,this[t(360)]=!1,this[t(367)]=Cesium[t(338)](e[t(339)][t(309)]),e[t(359)].push(this[t(291)])),this[t(350)]<this[t(373)]){let a=Cesium[t(406)].addMinutes(this[t(362)],10*this[t(350)],new(Cesium[t(406)])),n=this.setSunAndMoonDirections({time:a});this._shadowmap[t(310)][t(309)]=n[t(309)],this[t(340)][t(310)][t(303)]=n[t(303)],this[t(340)][t(370)]=!0,e[t(349)][t(385)](this[t(340)]),e[t(359)][t(385)](...this[t(372)]),this._index++}else{if(this._samplePoints&&this[t(337)]&&!this[t(360)]){let e=this[t(387)].map((e=>Cesium[t(351)].fromCartesian(e)));var a=function(e,t,a){var i=n,o=viewer.scene.context;const s=o[i(148)];if(s[i(161)](s[i(153)])===s[i(130)])return t[i(149)]((t=>{var n=i;null!=a&&(t[n(164)]=a),t=Cesium.Cartographic[n(135)](t);let s=Cesium.SceneTransforms[n(129)](viewer[n(136)],t);return o[n(160)]({x:Number[n(167)](s.x),y:Number[n(167)](s.y),width:1,height:1,framebuffer:e})}))}(this[t(290)],e,this._option[t(333)]);this[t(337)](a),this._isSampleDone=!0}e[t(359)][t(385)](...this.polygonCmds)}}[p(297)](e){const t=p;let a=new(Cesium[t(344)]),n=new(Cesium[t(325)]);Cesium[t(356)](Cesium[t(318)][t(405)](e.time,n))||(n=Cesium.Transforms[t(346)](e[t(315)],n));let i=Cesium[t(302)].computeSunPositionInEarthInertialFrame(e[t(315)],a);Cesium[t(325)][t(316)](n,i,i);let o=new(Cesium[t(344)]);Cesium.Cartesian3[t(396)](i,o);let s=new(Cesium[t(395)])(viewer[t(334)]);return s[t(309)]=i,s[t(303)]=o,s}[p(371)](){}[p(377)](e,t){const a=p;this.viewer=e,this[a(378)]=e[a(334)][a(378)],this[a(375)]=this[a(378)][a(375)],this[a(401)]=t[a(401)]||Cesium[a(293)][a(326)],this[a(324)]=t[a(324)]||Cesium.Color[a(392)],this[a(322)]=.5}[p(342)](){}[p(319)](){const e=p;this[e(298)]&&viewer[e(334)][e(313)][e(355)](this[e(298)])}}e.RZPrimitiveX=C}));
