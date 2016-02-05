//struct point
function Point(x, y) {
    this.x = x;
    this.y = y;
}
function Element(ePoint,mark){//元素的位置，和元素的标志，
    this.ePoint=ePoint;       //通过元素标志判断是否为同一个元素
    this.mark=mark;
}
var Action = function() {};
$.extend(Action.prototype, {
        //初始化变量
        config: {
            rootSize: 1,
            clientWidth: 0,
            clientHeight: 0,
            elementWidth: 85, //元素的宽高
            elementHeight: 105,
            sprite1: new Image(), //items，基本图
            sprite2: new Image(), //元素，特效图
            pathImage: new Image(),
            pathFlash: new Image(), //路径特效图
            boom: new Image(), //绘制爆炸
            binaryMap: [
                [1, 1, 1, 1, 1, 1], //二进制地图6*7
                [0, 0, 0, 0, 0, 1],
                [0, 0, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1],
            ],
            elementMap:[],//元素地图
            elementStart: new Point(50, 100),
        },
        //初始化
        init: function() {
            var self = this;
            self.config.rootSize = parseFloat($('html').css('font-size')) / 100;
            self.config.clientWidth = document.documentElement.clientWidth;
            self.config.clientHeight = document.documentElement.clientHeight;
            var canvas = document.getElementById('myCanvas');
            var ctx = canvas.getContext('2d');
            self.config.sprite1.src = "sprite1.png";
            self.config.sprite2.src = "sprite2.png";
            self.config.pathImage.src = "path.png";
            self.config.boom.src = "boom.png";
            var trans = self.config.rootSize;
            self.config.sprite2.onload = function() {
                self.config.elementMap=self.initMap(ctx);
            }
        self.initListener();
    },
    initListener: function() {
        var self = this;
        var canvas = document.getElementById('myCanvas');
        ctx = canvas.getContext('2d');
        //canvas.addEventListener('touchstart',self.canvasTouch,false);
        $("#myCanvas").on('touchstart', function(e) {
            self.canvasTouch(ctx, e, self);
        });
    },
        //元素地图初始化
    initMap: function(ctx) {
        var self = this;
        var bMap=self.config.binaryMap,//二进制地图
            eMap=self.config.elementMap,//元素地图
            startP = self.config.elementStart,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            trans = self.config.rootSize;
        var iPoint = new Point(0, 0);
        //self.drawElement(ctx, startP, iPoint);

        for (var i = 0; i < 7; i++) {
            for(var j =0;j<6;j++){
                if(bMap[i][j]){
                    //元素的位置，和标志
                    var ePoint=new Point(startX+(eWidth * trans - 5) * j,startY + (eHeight * trans - 5) * i),
                        mark = 1,
                        element=new Element(ePoint,mark);
                    eMap.push(element);
                    var iPoint = new Point(0, 0);
                    self.drawElement(ctx, ePoint, iPoint);
                }
            }
        }
        return eMap;
    },
        //画连连看基本元素
        drawElement: function(ctx, ePoint, iPoint) { //ePoint元素位置 iPoint是items在sprite的定位
                var self = this;
                var eHeight = self.config.elementHeight,
                    eWidth = self.config.elementWidth,
                    sprite2 = self.config.sprite2,
                    sprite1 = self.config.sprite1,
                    trans = self.config.rootSize;
                ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                ctx.drawImage(sprite2, 7, 7, eWidth, eHeight, ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                setTimeout(function() {
                    self.elementSreversal(ctx, ePoint, iPoint);
                }, 300);

            },
            //元素翻转动画
            elementSreversal: function(ctx, ePoint, iPoint) {
                var self = this;
                var eHeight = self.config.elementHeight,
                    eWidth = self.config.elementWidth,
                    sprite2 = self.config.sprite2,
                    sprite1 = self.config.sprite1,
                    trans = self.config.rootSize;
                setTimeout(function() {
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                    ctx.drawImage(sprite2, 438, 0, 75, 105, ePoint.x, ePoint.y, 75 * trans, 105 * trans);
                }, 400);
                setTimeout(function() {
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                    ctx.drawImage(sprite2, 375, 0, 65, 105, ePoint.x, ePoint.y, 65 * trans, 105 * trans);
                }, 300);
                setTimeout(function() {
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                    ctx.drawImage(sprite2, 328, 0, 45, 105, ePoint.x, ePoint.y, 45 * trans, 105 * trans);
                }, 200);
                setTimeout(function() {
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                    ctx.drawImage(sprite2, 288, 0, 43, 105, ePoint.x, ePoint.y, 43 * trans, 105 * trans);
                }, 100);
                setTimeout(function() {
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                    ctx.drawImage(sprite2, 7, 7, eWidth, eHeight, ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
                }, 500);
                setTimeout(function() { //画Items
                    ctx.drawImage(sprite1, iPoint.x, iPoint.y, 70, 70, ePoint.x, ePoint.y + 2, 70 * trans, 70 * trans);
                }, 600);
                return;
            },
            //点击事件
            canvasTouch: function(ctx, e, self) {
                //var self=this;
                var eHeight = self.config.elementHeight,
                    eWidth = self.config.elementWidth,
                    sprite2 = self.config.sprite2,
                    sprite1 = self.config.sprite1,
                    eMap=self.config.elementMap,
                    startX = self.config.elementStart.x,
                    startY = self.config.elementStart.y,
                    trans = self.config.rootSize,
                    eMap=self.config.elementMap;
                //console.log(event);
                var x = e.originalEvent.touches[0].clientX,
                    y = e.originalEvent.touches[0].clientY;
                for(var i in eMap ){
                    var eX=eMap[i].ePoint.x,//元素的具体位置想x,y
                        eY=eMap[i].ePoint.y;
                        if (x > eX && x < eX + eWidth * trans && y > eY && y < eY + eHeight * trans) {
                            ctx.clearRect(eX, eY, eWidth * trans - 5, eHeight * trans - 5);
                            ctx.drawImage(sprite2, 98, 5, 75, 95, eX, eY, 75 * trans, 95 * trans);
                            ctx.drawImage(sprite1, 0, 430, 70, 70, eX + 4, eY + 5, 70 * trans, 70 * trans);
                        ePoint = new Point(eX, eY);
                        //self.drwaBoom(ctx,ePoint);
                    }
                }
                

            },
            drawPath: function(ctx) {
                var self = this;
                var eHeight = self.config.elementHeight,
                    eWidth = self.config.elementWidth,
                    sprite2 = self.config.sprite2,
                    sprite1 = self.config.sprite1,
                    trans = self.config.rootSize,
                    pathFlash = self.config.pathFlash,
                    pathImage = self.config.pathImage;
                //ctx.drawImage(pathFlash,0,0,110,79,0,0,110*trans*.4,79*trans*.4);
                //ctx.drawImage(pathFlash,0,0,110,79,110*trans*.4,0,110*trans*.4,79*trans*.4);
                // var time=0;
                // while(time<10){
                //     ctx.drawImage(pathFlash,0,0,128,128,128*trans*.6*time,8,128*trans*.6,128*trans*.6);
                //     time++;
                // }
                var texture = ctx.createPattern(pathImage, "repeat");
                ctx.strokeStyle = texture;
                ctx.moveTo(0, 20);
                ctx.lineTo(400, 20);
                ctx.lineWidth = 3;
                ctx.stroke();
            },
            drwaBoom: function(ctx, ePoint) {
                var self = this;
                var eHeight = self.config.elementHeight,
                    eWidth = self.config.elementWidth,
                    boom = self.config.boom,
                    trans = self.config.rootSize;
                //ctx.clearRect(ePoint.x,ePoint.y,);
                setTimeout(function() {
                    //ctx.scale(.7,.7);
                    ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans - 5, eHeight * trans - 5);
                    //ctx.drawImage(boom,0,120,125,135,ePoint.x,ePoint.y,125*trans,125*trans);
                }, 250);
                // setTimeout(function(){
                //     ctx.clearRect(ePoint.x,ePoint.y,);
                //     ctx.scale(10/7,10/7);
                //     ctx.drawImage(boom,0,120,125,135,ePoint.x,ePoint.y,125*trans,125*trans);
                // },400);
            }
    });
new Action().init();