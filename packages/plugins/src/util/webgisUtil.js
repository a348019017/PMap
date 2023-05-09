

  //导出渲染的图像，使用context读取framebuffer，然后转换成image对象，最后下载出来
  export function  exportImage(_fb){

    
    var context = viewer.scene.context;
    const gl = context._gl;
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if(status === gl.FRAMEBUFFER_COMPLETE)
    {
      
      var pixels = context.readPixels({
        // x: 0,
        // y: 0,
        // width: context.canvas.width,
        // height: context.canvas.height,
        framebuffer: _fb,
      });
  
  
      var canvas = document.createElement('canvas');
      canvas.width = context.canvas.width;
      canvas.height = context.canvas.height;
      var context = canvas.getContext('2d');
  
      // Copy the pixels to a 2D canvas
      var imageData = context.createImageData(canvas.width, canvas.height);
      imageData.data.set(pixels);
      context.putImageData(imageData, 0, 0);
  
      var img = new Image();
      img.src = canvas.toDataURL();
      return img;
    }
    return null;
    
  }


  //测试导出文件
  export function exportImageTest(_fb){
    let img= exportImage(_fb);
    if(!img)
       return;
    ///let url = window.URL.createObjectURL(new Blob([data],{type: exportGs}));
    let url=img.src;
    let link = document.createElement('a')
    link.style.display = 'none'
    link.href = url;
    link.setAttribute('download', '文件');
    document.body.appendChild(link)
    link.click();
  }


  //获取平面的高度
  export function PickPosition(_fb,positions,height){
    var context = viewer.scene.context;
    const gl = context._gl;
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status === gl.FRAMEBUFFER_COMPLETE) {
     return positions.map((position) => {
        
        height != undefined ? (position.height = height) : undefined;
        position = Cesium.Cartographic.toCartesian(position);

        let chanedc = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          viewer.scene,
          position
        );

        var pixels = context.readPixels({
          x: Number.parseInt(chanedc.x),
          y: Number.parseInt(chanedc.y),
          width: 1,
          height: 1,
          framebuffer: _fb,
        });

        return pixels;
      });
    }
  }

  //创建一个图例的图像，用于shader的图例尺寸为16*16*n，采用图像是为了便于shader的解析，结构化数据并不好写
  export function createlegendImage(legends,option){

    const baseHeight=16;
    const length=legends.length;
    const width=baseHeight*length;
    const height=baseHeight
    //创建canvas并进行绘制操作
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext('2d');

    context.beginPath();
    for (let index = 0; index < legends.length; index++) {
        const element = legends[index];
        let color=element.color;
        let x=baseHeight*index;
        let y=0;
        context.fillStyle=color;
        context.fillRect(x,y,baseHeight,baseHeight);      
    }

    var img = new Image();
      img.src = canvas.toDataURL();
      return img;
    


  }

  //测试创建图例
  export function testcreatelegendImage(){
    let legends=[
      {
          name:"1",
          title:"小于1小时",
          color:"#f50205",
          min:0,
          max:1,
      },
      {
          name:"2",
          color:"#f9a100",
          title:"1-2小时",
          min:1,
          max:2,
      },
      {
          name:"3",
          color:"#f5f701",
          title:"2-3小时",
          min:2,
          max:3,
      },
      {
          name:"4",
          color:"#a7f637",
          title:"3-4小时",
          min:2,
          max:3,
      },
      {
          name:"5",
          color:"#08f210",
          title:"4-5小时",
          min:2,
          max:3,
      },{
          name:"6",
          color:"#06f4f7",
          title:"5-6小时",
          min:2,
          max:3,
      },{
          name:"7",
          color:"#00baf6",
          title:"6-7小时",
          min:2,
          max:3,
      },{
          name:"8",
          color:"#0000f6",
          title:"7小时以上",
          min:2,
          max:3,
      }
  ];
    let img= createlegendImage(legends,{});
    if (!img) return;
    ///let url = window.URL.createObjectURL(new Blob([data],{type: exportGs}));
    let url = img.src;
    let link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", "文件");
    document.body.appendChild(link);
    link.click();
  }
