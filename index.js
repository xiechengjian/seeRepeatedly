//struct point
function Point(x,y){
    this.x=x;
    this.y=y;
}
var Action = function(){};
$.extend(Action.prototype ,{
    //初始化变量
    config:{
        rootSize:1,
        clientWidth:0,
        clientHeight:0,
        elementWidth:95,//元素的宽高
        elementHeight:115,
        sprite1:new Image(),//items，基本图
        sprite2:new Image(),//元素，特效图
    },
    //初始化
    init:function(){
        var self=this;
        self.config.rootSize=parseFloat($('html').css('font-size'))/100;
        self.config.clientWidth=document.documentElement.clientWidth;
        self.config.clientHeight=document.documentElement.clientHeight;
        var canvas = document.getElementById('myCanvas');
        var ctx=canvas.getContext('2d');
        self.config.sprite1.src="sprite1.png";
        self.config.sprite2.src="sprite2.png";
        var trans=self.config.rootSize;
        self.config.sprite2.onload=function(){
            var ePoint=new Point(50,50);
            var iPoint=new Point(0,0);
            self.drawElement(ctx,ePoint,iPoint);
            var ePoint=new Point(200,200);
            var iPoint=new Point(70,0);
            self.drawElement(ctx,ePoint,iPoint);
        };

        self.initListener();
    },
    initListener:function(){
        var self=this;
        var canvas=document.getElementById('myCanvas');
            ctx=canvas.getContext('2d');
        //canvas.addEventListener('touchstart',self.canvasTouch,false);
        $(".bg").on('touchstart',function(e){
            self.canvasTouch(ctx,e,self);
        });
    },
    //画连连看基本元素
    drawElement:function(ctx,ePoint,iPoint){//ePoint元素位置 iPoint是items在sprite的定位
        var self=this;
        var eHeight=self.config.elementHeight,
            eWidth=self.config.elementWidth,
            sprite2=self.config.sprite2,
            sprite1=self.config.sprite1,
            trans=self.config.rootSize;
        ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
        ctx.drawImage(sprite2,0,0,eWidth,eHeight,ePoint.x,ePoint.y,eWidth*trans,eHeight*trans);
        setTimeout(function(){
                    self.elementSreversal(ctx,ePoint,iPoint);
                },300);

    },
    //元素翻转动画
    elementSreversal:function(ctx,ePoint,iPoint){
        var self=this;
        var eHeight=self.config.elementHeight,
            eWidth=self.config.elementWidth,
            sprite2=self.config.sprite2,
            sprite1=self.config.sprite1,
            trans=self.config.rootSize;
        setTimeout(function(){
                ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
                ctx.drawImage(sprite2,438,0,75,110,ePoint.x,ePoint.y,75*trans,115*trans);
            },400);
        setTimeout(function(){
                ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
                ctx.drawImage(sprite2,375,0,65,110,ePoint.x,ePoint.y,65*trans,115*trans);
            },300);
        setTimeout(function(){
                ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
                ctx.drawImage(sprite2,328,0,45,110,ePoint.x,ePoint.y,45*trans,115*trans);
            },200);
        setTimeout(function(){
                ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
                ctx.drawImage(sprite2,288,0,43,110,ePoint.x,ePoint.y,43*trans,115*trans);
            },100);
        setTimeout(function(){
                ctx.clearRect(ePoint.x,ePoint.y,eHeight,eWidth);
                ctx.drawImage(sprite2,0,0,eWidth,eHeight,ePoint.x,ePoint.y,eWidth*trans,eHeight*trans);
            },500);
        setTimeout(function(){//画Items
                ctx.drawImage(sprite1,iPoint.x,iPoint.y,70,70,ePoint.x+6,ePoint.y+6,70*trans,70*trans);
            },600);
    },
    canvasTouch:function(ctx,e,self){
        //var self=this;
        var eHeight=self.config.elementHeight,
            eWidth=self.config.elementWidth,
            sprite2=self.config.sprite2,
            sprite1=self.config.sprite1,
            trans=self.config.rootSize;
        //console.log(event);
        var x=e.originalEvent.touches[0].clientX,
            y=e.originalEvent.touches[0].clientY;
        if(x>50&&x<50+eWidth&&y>50&&y<50+eHeight){
            ctx.clearRect(50,50,eHeight,eWidth);
            ctx.drawImage(sprite2,185,120,80,112,50,50,80*trans,112*trans);
            ctx.drawImage(sprite1,0,0,70,70,50+4,50+6,70*trans,70*trans);
            setTimeout(function(){
                ctx.clearRect(50,50,eHeight,eWidth);
                ctx.drawImage(sprite2,95,0,eWidth,eHeight,50,50,eWidth*trans,eHeight*trans);
                ctx.drawImage(sprite1,0,0,70,70,50+6,50+6,70*trans,70*trans);
            },200);
        }
    }
});
 new Action().init();