
import { createlegendImage,PickPosition } from "./util/webgisUtil";


//此shader不需要lightcamera，实际上太阳日照不必考虑这个，小范围可以考虑,这里考虑添加clipplane以支持空间裁剪
const glsl2 = `
varying vec2 v_textureCoordinates;
uniform sampler2D colorTexture;   //这里可以不用colortexture，仅适用depthtexture即可
uniform sampler2D depthTexture;
uniform sampler2D shadowMap_texture;
uniform mat4 shadowMap_matrix;
uniform vec4 shadowMap_lightPositionEC;
uniform vec3 shadowMap_lightDirectionEC;
uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;

uniform float helsing_alpha;
uniform vec4 helsing_visibleAreaColor;
uniform vec4 helsing_invisibleAreaColor;


vec4 toEye(in vec2 uv, in float depth){
    vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
    vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);
    posInCamera =posInCamera / posInCamera.w;
    return posInCamera;
}
float getDepth(in vec4 depth){
    float z_window = czm_unpackDepth(depth);
    z_window = czm_reverseLogDepth(z_window);
    float n_range = czm_depthRange.near;
    float f_range = czm_depthRange.far;
    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
}
float _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){
    return texture2D(shadowMap, uv).r;
}
float _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){
    return step(depth, _czm_sampleShadowMap(shadowMap, uv));
}
float _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){
    float depthBias = shadowParameters.depthBias;
    float depth = shadowParameters.depth;
    float nDotL = shadowParameters.nDotL;
    float normalShadingSmooth = shadowParameters.normalShadingSmooth;
    float darkness = 0.3;
    vec2 uv = shadowParameters.texCoords;
    depth -= depthBias;
    float visibility = _czm_shadowDepthCompare(shadowMap, uv, depth);

    return visibility;
}

void applyNormalOffset(inout vec4 positionEC, vec3 normalEC, float nDotL) 
{ 
  
} 


void main(){
    const float PI = 3.141592653589793;
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    //float depth = czm_readDepth(depthTexture, v_textureCoordinates);
    // if(currentDepth.r >= 1.0){
    //     gl_FragColor = color;
    //     return;
    // }
    float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
    
    vec4 positionEC = toEye(v_textureCoordinates,depth);
    depth = -positionEC.z;
    vec3 normalEC = vec3(1.0);
    czm_shadowParameters shadowParameters;
    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
    //shadowParameters.depthBias *= max(depth * 0.01, 1.0);

    //shadowParameters.depthBias *= mix(1.0, 100.0, depth * 0.0015);

    float maxDepth = shadowMap_cascadeSplits[1].w;
    // Stop early if the eye depth exceeds the last cascade 
          if (depth > maxDepth) 
          { 
              gl_FragColor.rgb=color.rgb;
              gl_FragColor.a=color.a;
              return; 
          }
          // Get the cascade based on the eye-space depth 
          vec4 weights = czm_cascadeWeights(depth); 
          // Apply normal offset
          float nDotL = clamp(dot(normalEC, shadowMap_lightDirectionEC), 0.0, 1.0); 
          applyNormalOffset(positionEC, normalEC, nDotL); 
          // Transform position into the cascade 
          vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; 
          // Get visibility 
          shadowParameters.texCoords = shadowPosition.xy; 
          shadowParameters.depth = shadowPosition.z; 
          shadowParameters.nDotL = nDotL; 
          float visibility =  czm_shadowVisibility(shadowMap_texture, shadowParameters); 
          // Fade out shadows that are far away 
          float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; 
          float fade = max((depth - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); 
          visibility = mix(visibility, 1.0, fade); 
          //color.rgb*=visibility;
          gl_FragColor.rgb=color.rgb;
          gl_FragColor.a=color.a;
          //gl_FragColor *= czm_cascadeColor(weights);;
          //gl_FragColor = mix(color, helsing_visibleAreaColor, helsing_alpha);

          float rd=0.016667;
           vec4 helsing_visibleAreaColor=vec4(1.0*rd,0.0,0.0,1.0);
           vec4 helsing_unvisibleAreaColor=vec4(0.0,1.0*rd,0.0,1.0);

     // 可视域模式
     if (visibility > 0.90){
      gl_FragColor = helsing_visibleAreaColor;
  }
  else{
      gl_FragColor = helsing_unvisibleAreaColor;
  }
    
}`;

const fs = `
uniform sampler2D colorTexture;
uniform sampler2D legendTexture;
uniform sampler2D depthTexture;
varying vec2 v_textureCoordinates;
//多边形裁切
uniform highp sampler2D u_clippingPlanes;
uniform mat4 u_clippingPlanesMatrix;
uniform vec4 u_clippingPlanesEdgeStyle;


vec4 toEye( vec2 uv,  float depth){
  vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));
  vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);
  posInCamera =posInCamera / posInCamera.w;
  return posInCamera;
}
float getDepth( vec4 depth){
  float z_window = czm_unpackDepth(depth);
  z_window = czm_reverseLogDepth(z_window);
  float n_range = czm_depthRange.near;
  float f_range = czm_depthRange.far;
  return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
}

{clipshader}

void main()
{

    float clipDistance = clip(gl_FragCoord, u_clippingPlanes, u_clippingPlanesMatrix);

    

    vec4 clippingPlanesEdgeColor = vec4(1.0);
    clippingPlanesEdgeColor.rgb = u_clippingPlanesEdgeStyle.rgb;
    float clippingPlanesEdgeWidth = u_clippingPlanesEdgeStyle.a;

    if (clipDistance < clippingPlanesEdgeWidth)
    {
        vec4 finalColor = clippingPlanesEdgeColor;
    }


  //取colortexture的r通道
    vec4 color = texture2D(colorTexture, v_textureCoordinates);
    vec4 dcolor= texture2D(legendTexture, vec2(color.r,0.0));

    gl_FragColor = vec4(dcolor.rgb,1.0);
}`;


//测试修改阴影的颜色，光照部分标红，非光照部分标绿
export class RZPrimitive {
  constructor(viewer, options) {
    this.createShadowMap(viewer, options);
    this.init(options);
    this.addPostProcessStageX();
  }

  //更新裁切平面，之后再调整吧，这样可以不用处理模型了，方便不少
  updateClippingPlanes(primitive, frameState) {
    const clippingPlanes = primitive.clippingPlanes;
    if (!defined(clippingPlanes)) {
      return false;
    }

    clippingPlanes.update(frameState);

    const { clippingPlanesState, enabled } = clippingPlanes;

    if (enabled) {
      const uniforms = primitive._uniforms;
      uniforms.clippingPlanesTexture = clippingPlanes.texture;

      // Compute the clipping plane's transformation to uv space and then take the inverse
      // transpose to properly transform the hessian normal form of the plane.

      // transpose(inverse(worldToUv * clippingPlaneLocalToWorld))
      // transpose(inverse(clippingPlaneLocalToWorld) * inverse(worldToUv))
      // transpose(inverse(clippingPlaneLocalToWorld) * uvToWorld)

      uniforms.clippingPlanesMatrix = Matrix4.transpose(
        Matrix4.multiplyTransformation(
          Matrix4.inverse(
            clippingPlanes.modelMatrix,
            uniforms.clippingPlanesMatrix
          ),
          primitive._transformPositionUvToWorld,
          uniforms.clippingPlanesMatrix
        ),
        uniforms.clippingPlanesMatrix
      );
    }

    if (
      primitive._clippingPlanesState === clippingPlanesState &&
      primitive._clippingPlanesEnabled === enabled
    ) {
      return false;
    }
    primitive._clippingPlanesState = clippingPlanesState;
    primitive._clippingPlanesEnabled = enabled;

    return true;
  }

 

  //创建shadowmap，修改其lightcamera为太阳的位置
  createShadowMap(viewer, options) {
    this.viewer = viewer;
    //this.shadowMap = viewer.scene.shadowMap;
    //this.shadowMap.enabled=true;
    //viewer.scene.globe.shadows=Cesium.ShadowMode.DISABLED;

    //设置颜色
    this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
    this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
    this.alpha = 0.5;
  }


   /**
     * 根据多边形数组创建裁切面,相当于以球心为原点
     * @param points_ 多边形数组集合
     * @returns {[]} 返回裁切面数组
     */
   createClippingPlane(points_) {
    //计算中心点作为矩阵变换中心
    let points = points_;
    let centerWC = Cesium.BoundingSphere.fromPoints(points_).center;
    let transform= Cesium.Transforms.eastNorthUpToFixedFrame(centerWC);
    let inverseTransform= Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())


    let pointsLength = points.length;
    let clippingPlanes = []; // 存储ClippingPlane集合

    
    for (let i = 0; i < pointsLength; ++i) {
      let nextIndex = (i + 1) % pointsLength;
      let plane=this.createPlane(points[i],points[nextIndex],inverseTransform);
      clippingPlanes.push(plane)
    }
    //return clippingPlanes;这里不能支持凹多边形，因此需要转换成多组凸多边形然后合并应该就可以了
    let clippingPlaneCollection1 = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes,
      modelMatrix:transform,
      unionClippingRegions:true
    });
    return clippingPlaneCollection1;
  }

  /**
   * 选取屏幕坐标下的值
   * @param {*} position
   * @returns
   */
  pickPosition(position) {
    var context = viewer.scene.context;
    const gl = context._gl;
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status === gl.FRAMEBUFFER_COMPLETE) {
      //height != undefined ? (position.height = height) : undefined;
      //position = Cesium.Cartographic.toCartesian(position);
      let chanedc = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        position
      );

      var pixels = context.readPixels({
        x: Number.parseInt(chanedc.x),
        y: Number.parseInt(chanedc.y),
        width: 1,
        height: 1,
        framebuffer: this._fb,
      });

      return (pixels[0] * (this._count / 6.0)) / 255.0;
    }
    return -1;
  }



  createPlane(p1, p2, inverseTransform) {
    // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
    const p1C3 = this.getOriginCoordinateSystemPoint(p1, inverseTransform)
    const p2C3 = this.getOriginCoordinateSystemPoint(p2, inverseTransform)

    // 定义一个垂直向上的向量up
    const up = new Cesium.Cartesian3(0, 0, -10)
    //  right 实际上就是由p1指向p2的向量
    const right = Cesium.Cartesian3.subtract(p2C3, p1C3, new Cesium.Cartesian3())

    // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
    let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
    normal = Cesium.Cartesian3.normalize(normal, normal)

    // 由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
    const planeTmp = Cesium.Plane.fromPointNormal(p1C3, normal)
    return new  Cesium.ClippingPlane(planeTmp.normal,planeTmp.distance)
  }

  getOriginCoordinateSystemPoint(point, inverseTransform) {
    return Cesium.Matrix4.multiplyByPoint(
      inverseTransform, point, new Cesium.Cartesian3(0, 0, 0))
  }


  

  /**
   * 创建后期程序。这里尝试使用quadviewcommand进行创建
   *
   * @author Helsing
   * @date 2020/09/19
   * @ignore
   */
  addPostProcessStageX() {
    const that = this;
    const bias = this.shadowMap._primitiveBias;

    //let inputFramebuffer=viewer.scene.view.sceneFramebuffer._colorFramebuffer;

    let inputFramebuffer=viewer.scene.view.globeDepth.colorFramebufferManager;
    
    const _colorTexture = inputFramebuffer.getColorTexture(0);
    //获取depthtexture
    const _depthTexture = inputFramebuffer.getDepthStencilTexture();
    //const _depthTexture = viewer.scene.view.sceneFramebuffer.depthStencilTexture;
    const fragmentShader = new Cesium.ShaderSource({
      defines: ["LOG_DEPTH"],
      sources: [glsl2],
    });

    var viewportQuadCommand = viewer.scene.context.createViewportQuadCommand(
      fragmentShader,
      {
        uniformMap: {
          colorTexture:function(){
             return  _colorTexture;
          },
          depthTexture:function(){
             return _depthTexture;
          },
          helsing_alpha: function () {
            return that.alpha;
          },
          helsing_visibleAreaColor: function () {
            return that.visibleAreaColor;
          },
          helsing_invisibleAreaColor: function () {
            return that.invisibleAreaColor;
          },
          shadowMap_cascadeSplits: function () {
            return that.shadowMap._cascadeSplits;
          },
          shadowMap_cascadeMatrices: function () {
            return that.shadowMap._cascadeMatrices;
          },
          shadowMap_cascadeDistances: function () {
            return that.shadowMap._cascadeDistances;
          },
          shadowMap_texture: function () {
            return that.shadowMap._shadowMapTexture;
            //return Reflect.get(that.shadowMap, "_shadowMapTexture");
          },
          shadowMap_matrix: function () {
            return that.shadowMap._shadowMapMatrix;
            //return that.shadowMap._shadowMapMatrix;
          },
          shadowMap_lightPositionEC: function () {
            return that.shadowMap._lightPositionEC;
            //return that.shadowMap._lightPositionEC;
          },
          shadowMap_lightDirectionEC: function () {
            return that.shadowMap._lightDirectionEC;
            //return that.shadowMap._lightDirectionEC;
          },
          shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
            const t = new Cesium.Cartesian2();
            t.x = 1 / that.shadowMap._textureSize.x;
            t.y = 1 / that.shadowMap._textureSize.y;
            return Cesium.Cartesian4.fromElements(
              t.x,
              t.y,
              bias.depthBias,
              bias.normalShadingSmooth,
              new Cesium.Cartesian4()
            );
          },
          shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness:
            function () {
              return Cesium.Cartesian4.fromElements(
                bias.normalOffsetScale,
                that.shadowMap._distance,
                that.shadowMap.maximumDistance,
                0.3,
                new Cesium.Cartesian4()
              );
            },
        },
      }
    );
    viewportQuadCommand.pass = Cesium.Pass.OVERLAY;
    //viewportQuadCommand.pass=Cesium.Pass.OPAQUE;
    this._viewportQuadCommand = viewportQuadCommand;

    
    var renderState = Cesium.RenderState.fromCache({
      // depthTest: {
      //   enabled: true,
      // },
      //  depthMask: true,
      //  blending: Cesium.BlendingState.ALPHA_BLEND,
    });

    const expectedColorCommandBlending = Cesium.clone(
      Cesium.BlendingState.ADDITIVE_BLEND,
      true
    );
    const noColor = new Cesium.Color(0, 0, 0, 0.0);
    expectedColorCommandBlending.color = noColor;
    renderState.blending=expectedColorCommandBlending;

    
    this._viewportQuadCommand.renderState=renderState;
    this._viewportQuadCommand.framebuffer=that._fb;
    //设置其renderstate

    //创建一个新的quadview展示渲染后的结果

    this._ready = true;
  }


  
 //处理点的顺逆时针
 clockwisePositions(outerRing) {
  let tangentPlane = Cesium.EllipsoidTangentPlane.fromPoints(outerRing);
  let positions2D = tangentPlane.projectPointsOntoPlane(
    outerRing
  );
  let windingOrder = Cesium.PolygonPipeline.computeWindingOrder2D(positions2D);
  if (windingOrder === Cesium.WindingOrder.CLOCKWISE) {
    outerRing = outerRing.slice().reverse();
  }
  return outerRing;
}


  //其它初始化操作
  init(options) {
    let that = this;
    let starttime = new Date(Date.now());
    starttime.setHours(8, 0, 0);
    //总计计算60次，10个小时
    this._index = 0;
    this._count = 60;
    //间隔10分钟
    this._interval = 10;
    starttime = Cesium.JulianDate.fromDate(starttime);

    
    this._starttime = starttime;

    //创建一个shadowmap，默认开启
    //let sunCamera = this.setSunAndMoonDirections({ time: starttime });
    let inputFramebuffer=viewer.scene.view.globeDepth.colorFramebufferManager;
    
    //const _colorTexture = inputFramebuffer.getColorTexture(0);
    //获取depthtexture
    const _depthTexture = inputFramebuffer.getDepthStencilTexture();
  
    let shadowMap = new Cesium.ShadowMap({
      context: viewer.scene.context,
      lightCamera:  viewer.scene._shadowMapCamera,
      enabled: true,
    });

    this.shadowMap = shadowMap;
    this.shadowMap.enabled=true;

    var context = viewer.scene.context;

    //创建一个帧缓存
    var framebuffer = new Cesium.Framebuffer({
      context: context,
      colorTextures: [
        new Cesium.Texture({
          context: context,
          width: context.canvas.width,
          height: context.canvas.height,
        }),
      ],
      depthStencilRenderbuffer: new Cesium.Renderbuffer({
        context: context,
        width: context.canvas.width,
        height: context.canvas.height,
        format: Cesium.RenderbufferFormat.DEPTH_STENCIL,
      }),
    });
    this._fb = framebuffer;


    
    if (options.legends) {
      this._legendimage = createlegendImage(options.legends);
      Cesium.Resource.createIfNeeded(this._legendimage.src)
      .fetchImage()
      .then(function (image) {
        var vtxfTexture;
        var context = viewer.scene.context;
        if (Cesium.defined(image.internalFormat)) {
          vtxfTexture = new Cesium.Texture({
            context: context,
            pixelFormat: image.internalFormat,
            width: image.width,
            height: image.height,
            source: {
              arrayBufferView: image.bufferView,
            },
          });
        } else {
          // var dd = new Cesium.Sampler({
          //   minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
          //   magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
          // });
          vtxfTexture = new Cesium.Texture({
            context: context,
            source: image,
          });
        }

        that.vtxfTexture = vtxfTexture;
      })
    }

    var renderState = Cesium.RenderState.fromCache({
      // depthTest: {
      //   enabled: true,
      // },
      //  depthMask: true,
      //  blending: Cesium.BlendingState.ALPHA_BLEND,
    });
    //再创建一个quadview用于最终的渲染

    const fragmentShader = new Cesium.ShaderSource({
      sources: [fs],
      defines:["LOG_DEPTH"]
    });

    if (options.positions) {
      //要处理点的顺逆时针
      options.positions = this.clockwisePositions(options.positions);

      this._clippingPlanes = this.createClippingPlane(options.positions);

      //同时修改shader
      fragmentShader.defines.push("ENABLE_CLIPPING_PLANES");
      //测试添加clip相关的函数
      
      let ishader=`vec4 position = czm_windowToEyeCoordinates(fragCoord);`
      let fshader=
      `float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
      vec4 position = toEye(v_textureCoordinates,depth);`

      
      let rstshader=Cesium.getClippingFunction(this._clippingPlanes, viewer.scene.context).replace(ishader,fshader);

     let rfs=  fs.replace("{clipshader}",rstshader)

      debugger
      fragmentShader.sources[0]=rfs;
    }

 
    const scratchClippingPlanesMatrix = new Cesium.Matrix4();
    const scratchInverseTransposeClippingPlanesMatrix = new Cesium.Matrix4();
    var viewportQuadCommand = context.createViewportQuadCommand(fragmentShader, {
      uniformMap: {
        colorTexture: function () {
          //return undefined;
          //return viewer.scene.context._currentFramebuffer._colorTextures[0];
          
          return that._fb._colorTextures[0];
        },
        depthTexture:function(){
          return _depthTexture;
       },
        legendTexture: function () {
          return that.vtxfTexture;
        },
        u_clippingPlanes: function () {
          const clippingPlanes = that._clippingPlanes;
          if (Cesium.defined(clippingPlanes) && Cesium.defined(clippingPlanes.texture)) {
            // Check in case clippingPlanes hasn't been updated yet.
            return clippingPlanes.texture;
          }
          return viewer.scene.context.defaultTexture;
        },
        u_clippingPlanesMatrix: function () {
          const clippingPlanes = that._clippingPlanes;
          const transform = Cesium.defined(clippingPlanes)
            ? Cesium.Matrix4.multiply(
                viewer.scene.context.uniformState.view,
                clippingPlanes.modelMatrix,
                scratchClippingPlanesMatrix
              )
            : Cesium.Matrix4.IDENTITY;
    
          return Cesium.Matrix4.inverseTranspose(
            transform,
            scratchInverseTransposeClippingPlanesMatrix
          );
        },
        u_clippingPlanesEdgeStyle: function () {
          const clippingPlanes = that._clippingPlanes;
          if (Cesium.defined(clippingPlanes)) {
            const style = clippingPlanes.edgeColor;
            style.alpha = clippingPlanes.edgeWidth;
            // Check in case clippingPlanes hasn't been updated yet.
            return style;
          }
          let defaultcolor= Cesium.Color.WHITE;
          return defaultcolor;
        },
      },
      renderState: renderState,
    });


    
    
    
    viewportQuadCommand.pass=Cesium.Pass.OVERLAY;
    
    this._lastviewportQuadCommand = viewportQuadCommand;


    this._clearColorCommand = new Cesium.ClearCommand({
      color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
      pass: Cesium.Pass.OPAQUE,
      owner: this,
      //stencil : 0,
      framebuffer: this._fb,
    });

    this._cameraPosition = new Cesium.Cartesian3();


    // var customPrimitive = new Cesium.Primitive();
    // customPrimitive.update = this.update.bind(this);
    // viewer.scene.primitives.add(customPrimitive);

    viewer.scene.camera.changed.addEventListener(()=>{
      that._index=0;
    });
    viewer.scene.camera.percentageChanged=0.01;
    this._ready = false;
  }


  refresh(){
    this._index=0;
  }


  update(frameState){

    if (!this._ready) return;

    // update clipping planes
    var clippingPlanes = this._clippingPlanes;
    if (Cesium.defined(clippingPlanes) && clippingPlanes.enabled) {
      clippingPlanes.update(frameState);
    }

    //控制帧率
     if (this._index == 0) {
       frameState.commandList.push(this._clearColorCommand);
     }
    if (this._index < this._count) {
      let newdate = Cesium.JulianDate.addMinutes(
        this._starttime,
        10 * this._index,
        new Cesium.JulianDate()
      );
      //let newcamera = this.setSunAndMoonDirections({ time: newdate });
      //修改camera
      //
      //this._shadowmap._lightCamera.position = newcamera.position;
      //this._shadowmap._lightCamera.direction = newcamera.direction;

      //this.shadowMap._lightCamera=newcamera;
     // this._shadowmap.dirty = true;
    
      //这里需要手动更新sunDirectionWC到shadowmap中，使用scne下默认的shadowmap就可以不用
      viewer.clock.currentTime = newdate;
      const us = viewer.scene.context.uniformState;
      
      Cesium.Cartesian3.negate(us.sunDirectionWC, viewer.scene._shadowMapCamera.direction);
      frameState.shadowMaps.push(this.shadowMap);
      
      if(this._viewportQuadCommand)
      {
        frameState.commandList.push(this._viewportQuadCommand);
      }
      this._index++;
    }else
    {
      if(this._lastviewportQuadCommand)
      {
        frameState.commandList.push(this._lastviewportQuadCommand);
      }
      //this.shadowMap.enabled=false;
      //viewer.scene._environmentState.clearGlobeDepth=true;
    }
  }


  isDestroyed() {
    return false;
  }


  destoryCommand(command){
    const drawCommand = command;
    if (defined(drawCommand)) {
      drawCommand.shaderProgram =
        drawCommand.shaderProgram && drawCommand.shaderProgram.destroy();
    }
  }

  //释放shaderResource
  destroy() {
    this.destoryCommand(this._lastviewportQuadCommand);
    this.destoryCommand(this._viewportQuadCommand);
    return Cesium.destroyObject(this);
  }

  

  //清楚特效
  clear() {}
}
