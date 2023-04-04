import { geojson2Primitives2 } from "./util/geoutil";
import { createlegendImage,PickPosition } from "./util/webgisUtil";
import {setShaderDefault} from "./shadermapshader"

const customshader = `
uniform sampler2D image;
uniform sampler2D legend;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);
    
    vec2 UV = gl_FragCoord.xy/czm_viewport.zw;
    //从屏幕取样
    vec4 sampled = texture2D(image,UV).rgba;
    //sampled.r=0.5;
    vec4 dcolor= texture2D(legend, vec2(sampled.r,0.0));

    material.alpha=1.0;
    material.diffuse=dcolor.rgb;
    return material;
}

`;


//这里还需要将shader的修改也集成进来，两个版本1.99,1.101

Cesium.Material.RZType = "RZType";
Cesium.Material._materialCache.addMaterial(Cesium.Material.RZType, {
    fabric: {
        type: Cesium.Material.RZType,
        uniforms: {
            image: Cesium.Material.DefaultImageId,
            legend: Cesium.Material.DefaultImageId,
        },
        source: customshader,
    },
    //minificationFilter: Cesium.TextureMinificationFilter.LINEAR_MIPMAP_NEAREST,
    translucent: function (material) {
        return true;
        // const uniforms = material.uniforms;
        // return (
        //     uniforms.baseWaterColor.alpha < 1.0 || uniforms.blendColor.alpha < 1.0
        // );
    },
    //minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
    //magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
});



//仅创建一个shdowmap，通过修改camera来持续的叠加，以期提高精度
export class RZPrimitiveX {
  constructor(viewer, options) {
    //如果设置贴地，自动计算当前视图下的高度
    let that=this;
    this._option=options;

    this._samplePoints=options.samplePoints;
    this._sampleCallback=options.sampleCallback;
    this._isSampleDone=false;

    if (options.clampground) {
      
      options.positions=options.positions.map(i=>{
        let j= Cesium.Cartographic.fromCartesian(i);
        return j;
      })
      
      const promise = Cesium.sampleTerrainMostDetailed(
        viewer.terrainProvider,
        options.positions
      );
      Promise.resolve(promise).then(function (updatedPositions) {
        let maxheight=-9999;
        updatedPositions=updatedPositions.map(i=>{
          if(i.height>maxheight){
            maxheight=i.height;
          }
          return Cesium.Cartographic.toCartesian(i);
        })
        options.height=maxheight;
        options.positions=updatedPositions;
        that.init(viewer,options);
      });
    }else
    {
       that.init(viewer,options);
    }
  }


  //设置多边形的高度
  setHeight(value){
    //设置多边形的高度，这里直接修改primitive的modelmatrix来抬升高度，避免了顶点对象的修改，性能上有优势
    if (this.polygonprimitrive) {
      this.scaleHeight(value);
      //this._index=0;
    }
  }


  /**
   * 选取屏幕坐标下的值
   * @param {*} position 
   * @returns 
   */
  pickPosition(position)
  {
    
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

      return pixels[0]*(this._count/6.0)/255.0;
    }
    return -1;
  }

  refresh(){
    this._index=0;
  }

  scaleHeight(value) {
    //不方便直接修改primitive的原始坐标，可采用修改modelMatrix的方式进行动态抬升,
    let m = Cesium.Transforms.eastNorthUpToFixedFrame(this.centerWC);
    let inverse = Cesium.Matrix4.inverse(m, new Cesium.Matrix4());

    let offsetHeight = value - this.center.height;

    let mtranslation = Cesium.Matrix4.fromTranslation(
      new Cesium.Cartesian3(0.0, 0.0, offsetHeight)
    );
    let tt = Cesium.Matrix4.multiply(
      mtranslation,
      inverse,
      new Cesium.Matrix4()
    );
    this.polygonprimitrive.modelMatrix = Cesium.Matrix4.multiply(
      m,
      tt,
      new Cesium.Matrix4()
    );

    // if (this.polygoncutEnty) {
    //   this.polygoncutEnty.polygon.extrudedHeight=value;
    // }
  }


  init(viewer, options) {
    let that=this;
    this.show = true;
    this.secondsOfDay = 0;

    this._legendimage = "";

    var context = viewer.scene.context;
    //创建图例
    if (options.legends) {
      this._legendimage = createlegendImage(options.legends);
      //同时创建纹理指向
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
    this._cameraPosition = new Cesium.Cartesian3();

    //创建一个多边形的primtive，获取其commandlist
    if (options.positions) {
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

      var newhierarchy = new Cesium.PolygonHierarchy(options.positions);
      let polygeo = new Cesium.PolygonGeometry({
        polygonHierarchy: newhierarchy,
        height:options.height,
        //perPositionHeight:true,
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      });

      
     this.center= Cesium.BoundingSphere.fromPoints(options.positions).center;
     this.center=Cesium.Cartographic.fromCartesian(this.center);
     this.center.height=options.height;
     this.centerWC=Cesium.Cartographic.toCartesian(this.center);



      var polygonInstance = new Cesium.GeometryInstance({
        geometry: polygeo,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.0)
          ),
        },
      });

      //使用material渲染,这里无法使用texture进行注入uniform，因此方便点的是修改uniform，这里也涉及到,同时也可以考虑切掉地形直接展示
      let polygonPrimitive = new Cesium.Primitive({
        geometryInstances: polygonInstance,
        asynchronous: false,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: new Cesium.Material({
            fabric: {
              type: "RZType",
              uniforms: {
                legend: this._legendimage,
              },
            },
            minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
            magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
          }),
        }),
      });

      // let polygonPrimitive2 = new Cesium.GroundPrimitive({
      //   geometryInstances: polygonInstance,
      //   asynchronous: false,
      //   appearance: new Cesium.EllipsoidSurfaceAppearance({
      //     material: new Cesium.Material({
      //       fabric: {
      //         type: "RZType",
      //         uniforms: {
      //           legend: this._legendimage,
      //         },
      //       },
      //       minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
      //       magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST,
      //     }),
      //   }),
      // });


      this.polygonprimitrive = polygonPrimitive;

      let starttime = new Date(Date.now());
      starttime.setHours(16, 0, 0);
      //上午8时到下午16时
      //总计计算48次，8个小时
      this._index = 0;
      this._count = 48;
      starttime = Cesium.JulianDate.fromDate(starttime);

      this._starttime = starttime;

      //创建一个shadowmap，默认开启
      let sunCamera = this.setSunAndMoonDirections({ time: starttime });
      let shadowMap = new Cesium.ShadowMap({
        context: viewer.scene.context,
        lightCamera: sunCamera,
        enabled: true,
      });
      this._shadowmap = shadowMap;

      this._clearColorCommand = new Cesium.ClearCommand({
        color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
        pass: Cesium.Pass.OPAQUE,
        owner: this,
        //stencil : 0,
        framebuffer: this._fb,
      });

      this._isready = false;

      var fs = `
uniform sampler2D colorTexture;
uniform sampler2D legendTexture;
in vec2 v_textureCoordinates;

void main()
{
  //取colortexture的r通道
    vec4 color = texture(colorTexture, v_textureCoordinates);
    //color.r=0.5
    vec4 dcolor= texture(legendTexture, vec2(color.r,0.0));
    if(color.rgb!=vec3(0.0,0.,0.)){
      gl_FragColor = vec4(dcolor.rgb,0.8);
    }else
    {
      gl_FragColor = vec4(1.0,1.0,1.0,0.0);
    }
    
    
}`;

      var renderState = Cesium.RenderState.fromCache({
        // depthTest: {
        //   enabled: false,
        // },
        // depthMask: true,
        blending: Cesium.BlendingState.ALPHA_BLEND,
      });

      // var rs = Cesium.RenderState.fromCache({
      //   blending: {
      //     enabled: true,
      //     equationRgb: Cesium.BlendEquation.MIN,
      //     equationAlpha: Cesium.BlendEquation.MIN,
      //     functionSourceRgb: Cesium.BlendFunction.ONE,
      //     functionSourceAlpha: Cesium.BlendFunction.ONE,
      //     functionDestinationRgb: Cesium.BlendFunction.ZERO,
      //     functionDestinationAlpha: Cesium.BlendFunction.ZERO,
      //   },
      // });
      // var viewportQuadCommand = context.createViewportQuadCommand(fs, {
      //   uniformMap: {
      //     colorTexture: function () {
      //       //return undefined;
      //       //return viewer.scene.context._currentFramebuffer._colorTextures[0];
      //       return framebuffer._colorTextures[0];
      //     },
      //     legendTexture: function () {
      //       return that.vtxfTexture;
      //     },
      //   },
      //   renderState: renderState,
      //   framebuffer:this._fb2
      // });
      // viewportQuadCommand.pass = Cesium.Pass.OVERLAY;
      // //viewportQuadCommand.pass=Cesium.Pass.OPAQUE;
      // this._viewportQuadCommand = viewportQuadCommand;

      let that = this;

      this.polygonprimitrive.readyPromise.then((dt) => {
        setShaderDefault(true);
        let tocmd=dt._colorCommands;
        //let tocmd=[dt._primitive._primitive._colorCommands[1]];
        //let rst=dt._primitive._primitive._colorCommands
        let rst = tocmd.map((c) => {
          c.receiveShadows = true;
          
          let tt = Cesium.ShadowMap.createReceiveDerivedCommand(
            [that._shadowmap],
            c,
            true,
            viewer.scene._context,
            {}
          );
          tt.receiveCommand.receiveShadows = false;
          const expectedColorCommandBlending = Cesium.clone(
            Cesium.BlendingState.ADDITIVE_BLEND,
            true
          );
          const noColor = new Cesium.Color(0, 0, 0, 0.0);
          expectedColorCommandBlending.color = noColor;

          //新增一个参数标志加权数
          tt.receiveCommand.renderState.blending = expectedColorCommandBlending;
          tt.receiveCommand.pass = 7;
          tt.receiveCommand.framebuffer = that._fb;
          //测试输出到framebuffer进行叠加，然后根据这个叠加的纹理再进行计算。
          return tt.receiveCommand;
        });
        that._extraCmds = rst;
        //
        setShaderDefault(false);

        that.polygonCmds = tocmd.map((i) => {
          let j = Cesium.clone(i);

          j.uniformMap.image_1 = function () {
            //return that._fb._colorTextures[0];
            return framebuffer._colorTextures[0];
          };
          j.uniformMap.legend_0 = function () {
            return that.vtxfTexture;
            //return framebuffer._colorTextures[0];
          };
          return j;
        });

        
        that.polygonprimitrive.show = false;
        that._isready = true;
      });
      viewer.scene.primitives.add(this.polygonprimitrive);

      //window.ttyy = this.polygonprimitrive;
      //创建多个shadermap

      //不需渲染本地，仅仅渲染shadowmap,防止干扰手动创建commad
      //let rst=this.createshadowmap();
    }

    //this.createShadowMap(viewer, options);
    //this.addPostProcessStage();
  }

  //创建一个新的framebuffer
  createFramebuffer() {
    var context = viewer.scene.context;
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
    return framebuffer;
  }


  //传入采样点
  setSamplePoints(value){
    this._samplePoints=value;
    this._isSampleDone=false;
  }


  //不必一次性提交，当camera发生变化时自动刷新
  update(frameState) {
    if (!this.show) {
      return;
    }
    let that=this;
    if (!this._isready) return;
    if (Cesium.defined(this._extraCmds)) {
      if (!frameState.camera.position.equals(this._cameraPosition)) {
        this._index = 0;
        this._isSampleDone=false;
        this._cameraPosition = Cesium.clone(frameState.camera.position);
        //一个update这计算60次，而非每次计算一次
      }
      if(this._index==0){
        frameState.commandList.push(this._clearColorCommand);
      }
      if (this._index < this._count) {
        let newdate = Cesium.JulianDate.addMinutes(
          this._starttime,
          10 * this._index,
          new Cesium.JulianDate()
        );
        let newcamera = this.setSunAndMoonDirections({ time: newdate });
        //修改camera
        //
        this._shadowmap._lightCamera.position = newcamera.position;
        this._shadowmap._lightCamera.direction = newcamera.direction;
        //this._shadowmap._lightCamera=newcamera;
        this._shadowmap.dirty = true;
        frameState.shadowMaps.push(this._shadowmap);
        this._extraCmds.forEach(c=>{
          c.modelMatrix=that.polygonprimitrive.modelMatrix;
        })
        frameState.commandList.push(...this._extraCmds);

        this._index++;
      } else {
        //采样点的实时计算回调
        if(this._samplePoints&&this._sampleCallback&&!this._isSampleDone){
          
          let samplePoints=this._samplePoints.map(i=>{
             return Cesium.Cartographic.fromCartesian(i);
          });
            var rst= PickPosition(this._fb,samplePoints,this._option.height);
            this._sampleCallback(rst);
            this._isSampleDone=true;
        }
        
        // if (frameState.time.secondsOfDay - this.secondsOfDay > 10) {
        //   window.textExportImage(this._fb);
        //   this.secondsOfDay = frameState.time.secondsOfDay;
        // }
        //frameState.commandList.push(this._viewportQuadCommand);
        //全部渲染完成后计算指定点的值使用readpiexel，读取fb，
        this.polygonCmds.forEach(c=>{
          c.modelMatrix=that.polygonprimitrive.modelMatrix;
        })
        frameState.commandList.push(...this.polygonCmds);
        //渲染结束后展示
      }

      //每隔多少帧返回一张图片测试结果
    }
  }


  //传入经纬度坐标，计算其值
  

  //设置太阳的方向，仍然需要传入uniformstate
  setSunAndMoonDirections(frameState) {
    let sunPositionWC = new Cesium.Cartesian3();

    let transformMatrix = new Cesium.Matrix3();
    if (
      !Cesium.defined(
        Cesium.Transforms.computeIcrfToFixedMatrix(
          frameState.time,
          transformMatrix
        )
      )
    ) {
      transformMatrix = Cesium.Transforms.computeTemeToPseudoFixedMatrix(
        frameState.time,
        transformMatrix
      );
    }

    let position =
      Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
        frameState.time,
        sunPositionWC
      );
    Cesium.Matrix3.multiplyByVector(transformMatrix, position, position);

    let sunDirWC = new Cesium.Cartesian3();
    Cesium.Cartesian3.normalize(position, sunDirWC);

    //返回一个固定的camera，同时构造一个新的shadowap添加到渲染管线中，这里尝试添加8个也就是3个小时一个进行blend显示，也可以只让地形收到或者整个poststage
    //

    let sunCamera = new Cesium.Camera(viewer.scene);
    sunCamera.position = position;
    sunCamera.direction = sunDirWC;

    return sunCamera;
  }

  //创建多个阴影
  createShadowMaps() {}

  //创建shadowmap，修改其lightcamera为太阳的位置
  createShadowMap(viewer, options) {
    this.viewer = viewer;
    this.shadowMap = viewer.scene.shadowMap;
    this.lightCamera = this.shadowMap.lightCamera;

    //设置颜色
    this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
    this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
    this.alpha = 0.5;
  }

  //清楚特效
  clear() {}

  //移除资源
  destory() {
    if (this.polygonprimitrive) {
      viewer.scene.primitives.remove(this.polygonprimitrive);
    }
    //同时释放其它对象

  }
}
