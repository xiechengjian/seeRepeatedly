//struct point
function Point(x, y) {
    this.x = x;
    this.y = y;
} 
//struct Element
function Element(ePoint, mark, binaryPoint) { //元素的位置，和元素的标志,元素二进制图的位置
    this.ePoint = (ePoint != undefined) ? ePoint : new Point(0, 0); //通过元素标志判断是否为同一个元素
    this.mark = (mark != undefined) ? mark : -1;
    this.binaryPoint = (binaryPoint != undefined) ? binaryPoint : new Point(-1, -1);
}
//struct Path 
//路径至少两个点，最多四个点（即最多有两次拐弯）
function Path(startPoint ,point2,point3,endPoint){
    this.startPoint=(startPoint!=undefined) ? startPoint:-1;
    this.point2=(point2!=undefined) ? point2:-1;
    this.point3=(point3!=undefined) ? point3:-1;
    this.endPoint=(endPoint!=undefined) ? endPoint:-1;
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
            [7, 2, 6, 3, 5, 1], //二进制地图6*7
            [0, 0, 0, 0, 0, 6],
            [0, 0, 0, 0, 0, 1],
            [4, 2, 4, 3, 7, 5],
            [7, 1, 0, 0, 0, 7],
            [1, 0, 0, 0, 0, 3],
            [6, 6, 4, 4, 3, 1],
        ],
        items: [        //items在sprite中的微调校正
            [0,70, 140, 212, 283, 355, 428], //X轴校正
            [0,70, 140, 212, 287, 360, 430],//Y轴校正
        ],
        elementMap: [], //元素地图
        elementStart: new Point(50, 100),
        lastElement: new Element(),
        nowElement: new Element(),
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
            self.config.elementMap = self.initMap(ctx);
        }
        self.initListener();

        var startPoint=new Point(50,50);
            point2=new Point(50,70);
            point3=new Point(100,70);
            endPoint=new Point(100,20);
            path=new Path(startPoint,point2,point3,endPoint);
            self.drawPath(ctx,path);
    },
    initListener: function() {
        var self = this;
        var canvas = document.getElementById('myCanvas');
        ctx = canvas.getContext('2d');
        //canvas.addEventListener('touchstart',self.canvasTouch,false);
        $("#myCanvas").on('touchstart', function(e) {
            e.preventDefault();
            self.canvasTouch(ctx, e, self);
        });
    },
    //元素地图初始化
    initMap: function(ctx) {
        var self = this;
        var bMap = self.config.binaryMap, //二进制地图
            eMap = self.config.elementMap, //元素地图
            startP = self.config.elementStart,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            trans = self.config.rootSize;
        //self.drawElement(ctx, startP, iPoint);

        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 6; j++) {
                if (bMap[i][j]) {
                    //元素的位置，和标志
                    var ePoint = new Point(startX + (eWidth * trans - 5) * j, startY + (eHeight * trans - 5) * i),
                        mark = bMap[i][j],
                        binaryPoint = new Point(j, i),
                        element = new Element(ePoint, mark, binaryPoint);
                    eMap.push(element);
                    var iPoint = new Point(self.config.items[0][mark - 1], 0);
                    self.drawElement(ctx, ePoint, iPoint);
                }
            }
        }
        //self.findPath();
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
            eMap = self.config.elementMap,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            trans = self.config.rootSize,
            eMap = self.config.elementMap,
            items=self.config.items;
        //console.log(event);
        var x = e.originalEvent.touches[0].clientX,
            y = e.originalEvent.touches[0].clientY;
        for (var i in eMap) {
            var eX = eMap[i].ePoint.x, //元素的具体位置想x,y
                eY = eMap[i].ePoint.y;
            var last = self.config.lastElement,
                now = self.config.nowElement;
            if (x > eX && x < eX + eWidth * trans && y > eY && y < eY + eHeight * trans) {
                if (eMap[i] == last || eMap[i] == now) return;
                //清除上一个element，并重绘
                if (last.mark != -1 && last != eMap[i] && now != eMap[i] && last != now) {
                    ctx.clearRect(last.ePoint.x, last.ePoint.y, eWidth * trans - 5, eHeight * trans - 5);
                    ctx.drawImage(sprite2, 7, 7, eWidth - 8, eHeight - 8, last.ePoint.x, last.ePoint.y, (eWidth - 8) * trans, (eHeight - 8) * trans);
                    ctx.drawImage(sprite1,items[0][last.mark-1], 0, 70, 70, last.ePoint.x, last.ePoint.y + 2, 70 * trans, 70 * trans);
                }
                //点击换新的element items[0][eMap[i].mark-1]
                ctx.clearRect(eX, eY, eWidth * trans - 5, eHeight * trans - 5);
                ctx.drawImage(sprite2, 98, 5, 75, 95, eX, eY, 75 * trans, 95 * trans);
                ctx.drawImage(sprite1, items[0][eMap[i].mark-1]+5, 435, 70, 70, eX + 4, eY + 5, 70 * trans, 70 * trans);
                self.config.lastElement = self.config.nowElement;
                self.config.nowElement = eMap[i];
                // var now=self.config.nowElement,last=self.config.lastElement;
                // if(now==undefined&&last==undefined){
                //     self.config.lastElement=eMap[i];
                //     self.config.nowElement=eMap[i];
                // }else{

                //}
                var last=self.config.lastElement,now=self.config.nowElement;
                if(last!=now&&last.mark!=-1&&now.mark!=-1){
                    self.findPath();
                }
                ePoint = new Point(eX, eY);
                //self.drwaBoom(ctx,ePoint);
                return;
            }
        }


    },
    //寻找路径函数DFS算法
    findPath:function(){
        var self=this;
        var last=self.config.lastElement,
            now=self.config.nowElement,
            binaryMap=[
                    [0,0,0,0,0,0,0,0],//扩增新的地图，四周都为0，方便计算8*9
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
            ],
            visitMap=[    //标记地图
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
            ];
            for(var i =0;i<7;i++){
                for(var j=0;j<6;j++){
                    binaryMap[i+1][j+1]=self.config.binaryMap[i][j];
                }
                //console.log(binaryMap[i+1]);
            }
            for(var i=0;i<9;i++)console.log(binaryMap[i]);

            var start=new Point(now.binaryPoint.x+1,now.binaryPoint.y+1),
                end=new Point(last.binaryPoint.x+1,last.binaryPoint.y+1),
                corner=2,//拐角最多为2
                path=[],
                last=start;
                path.push(start);
                visitMap[start.y][start.x]=1;
                path=self.DFS(binaryMap,visitMap,corner,start,end,path,last);
                for(var i in path) console.log(path[i]);
            // array.push(start);
            // while(array.length!=0){ //终止条件队列为空 
            //     var temp=array.pop();
                
            //     //是最后一个点结束
            //     if(temp==end && )
            //     //右边
            //     if(temp.x+1<8&& !binaryMap[temp.x+1][temp.y]){
            //         point=new Point(temp.x+1,temp.y);
            //         array.push(point);
            //     }
            // }

    },
    //DFS算法
    //参数说明：
    //扩展的数组，访问标记数组，拐角（最大为2），起始点，结束点，路径保存数组，上一个点（判断是否为拐角）
    DFS:function(binaryMap,visitMap,corner,start,end,path,last){
        var self=this,l=last,c=corner;
        //返回条件
        if(start==end||!corner) return path ;
        var x=start.x,y=start.y;
        //先遍历右边的点，没有被访问过，不超过边界，没有其他元素
        if(!visitMap[y][x+1]&&x+1<8&&!binaryMap[y][x+1]){
           
            var newStart=new Point(x+1,y);
            if(last.x!=x+1&&last.y!=y){//不在在同一直线上，有拐角coner自减
                corner--;
                last=newStart;
            }
            //还有拐角
            if(corner){
                
                visitMap[y][x+1]=1;
                path.push(newStart);
                
                //递归
                self.DFS(binaryMap,visitMap,corner,newStart,end,path,last);
                visitMap[y][x+1]=0;
                
                path.pop();
                last=l;
                corner=c;

            }else{
                return;
            }
            //恢复递归前的状态
            
        }

        //遍历下边的点
        if(!visitMap[y+1][x]&&y+1<9&&!binaryMap[y+1][x]){
           
            var newStart=new Point(x,y+1);
            if(last.x!=x&&last.y!=y+1){//不在在同一直线上，有拐角coner自减
                corner--;
                last=newStart;
            }
            //还有拐角
            if(corner){
                
                 visitMap[y+1][x]=1;
                path.push(newStart);
                
                //递归
                self.DFS(binaryMap,visitMap,corner,newStart,end,path,last);
                visitMap[y+1][x]=0;
                path.pop();
                last=l;
                corner=c;

            }else{
                return;
            }
            //恢复递归前的状态
            
        }

        //遍历左边的点
        if(!visitMap[y][x-1]&&x-1>=0 &&!binaryMap[y][x-1]){
           
            var newStart=new Point(x-1,y);
            if(last.x!=x-1&&last.y!=y){//不在在同一直线上，有拐角coner自减
                corner--;
                last=newStart;
            }
            //还有拐角
            if(corner){
                
                 visitMap[y][x-1]=1;
                path.push(newStart);
                
                //递归
                self.DFS(binaryMap,visitMap,corner,newStart,end,path,last);
                visitMap[y][x-1]=0;
                path.pop();
                last=l;
                corner=c;

            }else{
                return;
            }
            //恢复递归前的状态
            
        }

        //遍历上边的点
        if(!visitMap[y-1][x]&&y-1>=0&&!binaryMap[y-1][x]){
           
            var newStart=new Point(x,y-1);
            if(last.x!=x&&last.y!=y-1){//不在在同一直线上，有拐角coner自减
                corner--;
                last=newStart;
            }
            //还有拐角
            if(corner){
                
                visitMap[y-1][x]=1;
                path.push(newStart);
                
                //递归
                self.DFS(binaryMap,visitMap,corner,newStart,end,path,last);
                visitMap[y-1][x]=0;
                path.pop();
                last=l;
                corner=c;

            }else{
                return;
            }
            //恢复递归前的状态
            
            
        }
        return path;
    },
    drawPath: function(ctx,path) {
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

        if(path.startPoint==-1||path.endPoint==-1){ return; }
        else{
            ctx.beginPath();
            ctx.moveTo(path.startPoint.x,path.startPoint.y);
            if(path.point2!=-1){
                ctx.lineTo(path.point2.x,path.point2.y);
            }
            if(path.point3!=-1){
                ctx.lineTo(path.point3.x,path.point3.y);
            }
            ctx.lineTo(path.endPoint.x,path.endPoint.y);
            //ctx.lineWidth = 3;
            ctx.stroke();
        }    
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



/*
pageLoad: function(){
        var self = this;
        function Load(){}
        Load.prototype.loadImgs = function(urls,callback) {
            this.urls = urls;
            this.imgNumbers = urls.length;
            this.loadImgNumbers = 0;
            var that =this;
            for(var i=0;i<urls.length;i++){
                var obj = new Image();
                obj.src = urls[i];
                obj.onload = function(){
                    that.loadImgNumbers++;
                    callback(parseInt((that.loadImgNumbers/that.imgNumbers)*100));
                }
            }
        };
        var loader = new Load();
        loader.loadImgs([self.config.boomPic.src,'../../../site/img/event/8bit/load.png','../../../site/img/event/8bit/result.png','../../../site/img/event/8bit/guide.png','../../../site/img/event/8bit/guideCloud1.png','../../../site/img/event/8bit/guideCloud2.png','../../../site/img/event/8bit/guideStar.png','../../../site/img/event/8bit/rule.jpg','../../../site/img/event/8bit/start.png',self.config.bg.src,self.config.bullet.src,self.config.dead.src,self.config.clock.src,self.config.guard.src,self.config.plane.src,self.config.redBag.src,self.config.lighting.src,self.config.star.src,'../../../site/img/event/8bit/halo.png','../../../site/img/event/8bit/double.png','../../../site/img/event/8bit/cloud.png'],function(percent){
            $(".load-word").empty().html(percent+"%");
            if(percent==100) {
                $('.load').removeClass('loadani').addClass('loadend');
                $('.mask-up').addClass('maskupani');
                $('.mask-down').addClass('maskdownani');
                $('.load-word').addClass('hide');
                // canvas初始化
                var canvas = document.getElementById('stage');
                var ctx = canvas.getContext('2d');
                ctx.drawImage(self.config.bg, 0, 0, self.config.bgWidth, self.config.bgHeight);
                self.initListener(ctx);
                self.run(ctx);
                setTimeout(function(){
                    $('.load').removeClass('loadend').addClass('hide');
                    $('.mask-up').removeClass('maskupani').addClass('hide');
                    $('.mask-down').removeClass('maskdownani').addClass('hide');
                    $('.plane').removeClass('hide')
                }, 1400);
            };
        });
    },
*/