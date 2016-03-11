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
        path:[],//路径
        pathCorner:0,//路径转角
        sprite1: new Image(), //items，基本图
        sprite2: new Image(), //元素，特效图
        sprite3:new Image(),//数字图
        pathImage: new Image(),
        pathFlash: new Image(), //路径特效图
        boom: new Image(), //绘制爆炸
        combo:0,//连击
        validTime:2000,//combo有效时间500ms
        timer:0,//setTimeout,时间种子
        score:0,//计分
        gameTime:60,//总的计时默认60s
        bgm1:new Audio(),//开场音乐
        bgm2:new Audio(),//游戏主场景音乐
        eliminate1:new Audio(),//连击的8种音效
        eliminate2:new Audio(),
        eliminate3:new Audio(),
        eliminate4:new Audio(),
        eliminate5:new Audio(),
        eliminate6:new Audio(),
        eliminate7:new Audio(),
        eliminate8:new Audio(),
        drop:new Audio(),//点击音效
        start:false,
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
        $(".home-page").css('height',self.config.clientHeight+'px');
        $(".game-mode").css('height',self.config.clientHeight+'px');
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        //资源初始化
        self.config.sprite1.src = "images/sprite1.png";
        self.config.sprite2.src = "images/sprite2.png";
        self.config.sprite3.src = "images/sprite3.png";
        self.config.pathImage.src = "images/path.png";
        self.config.boom.src = "images/boom.png";
        self.config.eliminate1.src="music/eliminate1.mp3";
        self.config.eliminate2.src="music/eliminate2.mp3";
        self.config.eliminate3.src="music/eliminate3.mp3";
        self.config.eliminate4.src="music/eliminate4.mp3";
        self.config.eliminate5.src="music/eliminate5.mp3";
        self.config.eliminate6.src="music/eliminate6.mp3";
        self.config.eliminate7.src="music/eliminate7.mp3";
        self.config.eliminate8.src="music/eliminate8.mp3";
        self.config.bgm1.src="music/bgm1.mp3";
        self.config.bgm2.src="music/bgm2.mp3";
        self.config.drop.src="music/drop.mp3";
        var trans = self.config.rootSize;
        //界面监听
        self.pageLoad();
        
        
    },
    //界面监听初始化
    initListener: function() {
        var self = this;
        var canvas = document.getElementById('myCanvas');
        self.config.bgm1.play();
        self.config.bgm1.loop=true;
        //首页监听事件，点击进入模式选择
        $(".home-page").on('click',function(e){
            self.config.bgm1.pause();
            e.preventDefault();
            $(".home-page").addClass("hide");
            $(".game-mode").removeClass("hide");
        });
        //模式选择监听事件，选择两种模式
        //经典模式
        $(".jindian-mode").on('click',function(e){
            e.preventDefault();
            $(".game-mode").addClass("hide");
            $(".gameBg").removeClass("hide");
            //self.config.bgm2.play();
            self.initMap(ctx);
            var time=self.config.gameTime,
                trans=self.config.rootSize;
            self.drawTime(ctx,time,trans);
        });
        //首页眼睛眨的动画
        var timer=setInterval(function(){
             $(".boy").addClass("boy-move");
             $(".girl").addClass("boy-move");
             setTimeout(function(){
                $(".boy").removeClass("boy-move");
                $(".girl").removeClass("boy-move");
             },250);
             //取消动画
             if($(".home-page").hasClass("hide")){
                clearInterval(timer);
             }
        },3000);
        ctx = canvas.getContext('2d');
        //canvas.addEventListener('touchstart',self.canvasTouch,false);
        $("#myCanvas").on('touchstart', function(e) {
            e.preventDefault();
            self.canvasTouch(ctx, e, self);
            // x = e.originalEvent.touches[0].clientX,
            // y = e.originalEvent.touches[0].clientY;
            // var ePoint1=new Point(x,y);
            // var ePoint2=new Point(50,50);
            // self.drwaBoom(ctx,ePoint1,ePoint2);
        });
    },
    //元素地图初始化
    initMap: function(ctx) {
        var self = this;
        var bMap = self.config.binaryMap, //二进制地图
            eMap = [], //元素地图
            startP = self.config.elementStart,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            trans = self.config.rootSize;
        //清屏
        ctx.clearRect(0,startY,clientWidth,clientHeight-180);
        self.config.lastElement=new Element();
        self.config.nowElement=new Element();
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
        //self.drawCombo(ctx,5,trans);
        // setTimeout(function(){
        //     self.drawCombo(ctx,0,trans);
        // },100);
        self.config.start=true;
        self.config.elementMap.length=0;
        self.config.elementMap=eMap;
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
        if(!self.config.start){
            setTimeout(function() {
            self.elementSreversal(ctx, ePoint, iPoint);
            }, 300);
        }else{
            ctx.drawImage(sprite1, iPoint.x, iPoint.y, 70, 70, ePoint.x, ePoint.y + 2, 70 * trans, 70 * trans);
        }
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
                if(now.mark==-1){
                    self.config.drop.play();
                }
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
                //mark相同的element寻找是否可行路径
                self.config.path.length=0;
                if(last!=now&&last.mark!=-1&&now.mark==last.mark){
                    if(self.findPath(ctx)){//是可行的元素绘制路线
                        var last=self.config.lastElement,
                        now=self.config.nowElement;
                        self.config.binaryMap[last.binaryPoint.y][last.binaryPoint.x]=0;
                        self.config.binaryMap[now.binaryPoint.y][now.binaryPoint.x]=0;
                        //有效时间内连击
                        var validTime=self.config.validTime,
                            score=self.config.score,
                            combo=self.config.combo;
                        //8连击后清除连击，弹出一个perfect界面
                        if(combo>=8){
                            self.config.combo=0;
                            var clientHeight=self.config.clientHeight,
                            clientWidth=self.config.clientWidth,
                            y=15,//comob位置
                            x=clientWidth-150;
                            ctx.clearRect(x,y,125*trans*1.5,70*trans*1.5);
                        }else{
                            self.config.combo++;
                        }
                        //绘制combo
                        self.drawCombo(ctx,self.config.combo,trans);
                        //计分！！统计
                        var comboScore=0;
                        if(combo){
                            comboScore=(self.config.combo-1)*150;
                        }
                        score=score+100+comboScore;
                        self.config.score=score;
                        self.drawScore(ctx,score,trans);
                        
                        setTimeout(function(){
                            self.initMap(ctx);
                        },50);
                        //绘制爆炸
                        setTimeout(function(){
                        self.drwaBoom(ctx,last.ePoint,now.ePoint);
                        },100);
                    }else{//没有可行路线，清空连击
                        self.config.combo=0;//连击清空
                        clearTimeout(self.config.timer);
                    }
                }else if(now.mark!=last.mark&&last.mark!=-1){//两个元素不一样
                    self.config.combo=0;                    //连击清空
                    clearTimeout(self.config.timer);        
                var clientHeight=self.config.clientHeight,
                    clientWidth=self.config.clientWidth,
                    y=15,//comob位置
                    x=clientWidth-150;
                    ctx.clearRect(x,y,125*trans*1.5,70*trans*1.5);
                }
                ePoint = new Point(eX, eY);
                //
                return;
            }
        }


    },
    //寻找路径函数DFS算法
    findPath:function(ctx){
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
            //for(var i=0;i<9;i++)console.log(binaryMap[i]);

            var start=new Point(now.binaryPoint.x+1,now.binaryPoint.y+1),
                end=new Point(last.binaryPoint.x+1,last.binaryPoint.y+1),
                corner=2,//拐角最多为2
                path=[],
                last=start;
                path.push(start);
                visitMap[start.y][start.x]=1;
            self.DFS(binaryMap,visitMap,corner,start,end,path,last);

            var startX = self.config.elementStart.x,
                startY = self.config.elementStart.y,
                eHeight = self.config.elementHeight,
                eWidth = self.config.elementWidth,
                trans = self.config.rootSize,
                path=self.config.path;
            //path路径转换为Path,初始化Path路径
            // for(var i in path) {
            //     console.log(path[i]);
            // }
            // console.log(">>>>>>>>>>>>>>>>>>");

            if(path.length){
                //temp存储转换为Path的路径2--4个点（路径点）
                var start=path[0],temp=[];
                //添加起点
                var X=startX + (eWidth * trans - 5) * path[0].x-eWidth*trans/2,
                    Y=startY + (eHeight * trans - 5) *path[0].y-eHeight*trans/2,
                    startPoint=new Point(X,Y);
                temp.push(startPoint);
                //添加中间两个关键点
                for(var i=1;i<path.length;i++){
                    if(start.x!=path[i].x&&start.y!=path[i].y){
                        var pointX=startX + (eWidth * trans - 5) * path[i-1].x-eWidth*trans/2,
                            pointY=startY + (eHeight * trans - 5) * path[i-1].y-eHeight*trans/2,
                            point=new Point(pointX,pointY);
                        temp.push(point);
                        start=path[i-1];
                    }
                }
                //添加终点
                var endX=startX + (eWidth * trans - 5) * path[path.length-1].x-eWidth*trans/2,
                    endY=startY + (eHeight * trans - 5) *path[path.length-1].y-eHeight*trans/2,
                    endPoint=new Point(endX,endY);
                temp.push(endPoint);
                //绘制路径
                self.drawPath(ctx,temp);
                
                
                return true;
                //清除元素并重新绘制
                
            }else{
                return false;
            }
    },
    //DFS算法
    //参数说明：
    //扩展的数组，访问标记数组，拐角（最大为2），起始点，结束点，路径保存数组，上一个非直线点（判断是否为拐角）
    DFS:function(binaryMap,visitMap,corner,start,end,path,last){
        //
        var self=this,l=last,c=corner;
        var length;
        if(!self.config.path.length){
            length=Infinity;
        }else{
            length=self.config.path.length;
        }
        //返回条件，正在寻找的路径大于当前最短路径
        if(start==end||!corner||path.length>length) {
            return;
        }
        var right=new Point(1,0),
            bottom=new Point(0,1),
            left=new Point(-1,0),
            top=new Point(0,-1),
            ary=[right,bottom,left,top];
            //一次遍历右，下，左，上四个点
            for(var i in ary){
                var x=start.x+ary[i].x,
                    y=start.y+ary[i].y;
                //不超过边界，没有被访问过
                if(x<8&&x>=0&&y<9&&y>=0&&!visitMap[y][x]){
                    var newStart=new Point(x,y),newX=newStart.x,newY=newStart.y;
                    //不在在同一直线上，有拐角coner自减
                    if(last.x!=newX&&last.y!=newY){
                        corner=c-1;
                        last=newStart;
                    }
                    //还有拐角
                    if(corner>=0){
                        if(!binaryMap[newY][newX]){//右边没有其他元素，可行点标记，保存并递归
                            visitMap[newY][newX]=1;
                            path.push(newStart);
                            //递归
                            self.DFS(binaryMap,visitMap,corner,newStart,end,path,last);
                            //还原递归前状态
                            visitMap[newY][newX]=0;
                            path.pop();
                            last=l;
                            corner=c;
                        }else if(newStart.x==end.x&&newStart.y==end.y){//该点是终点，找到路径，选择最小路径
                            visitMap[newY][newX]=1;
                            path.push(newStart);
                            //for(var i in path) console.log(path[i]);
                            var length;
                            //选取路径最短且转角最少的路径
                            if(!self.config.path.length){
                                self.config.path=path.slice(0,path.length);
                                self.config.pathCorner=corner;
                            }else{
                                length=self.config.path.length;
                                if(length>path.length){
                                    self.config.path=path.slice(0,path.length);
                                    self.config.pathCorner=corner;
                                }else if(length==path.length&&corner<self.config.pathCorner){
                                    self.config.path=path.slice(0,path.length);
                                    self.config.pathCorner=corner;
                                }
                            }
                            //还原递归前状态
                            visitMap[newY][newX]=0;
                            path.pop();
                            last=l;
                            corner=c;
                            return;
                        }
                    }
                    last=l;
                    corner=c;
            }
        }
        return ;
    },
    drawPath: function(ctx,path) {
        var self = this;
        var eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            sprite2 = self.config.sprite2,
            sprite1 = self.config.sprite1,
            trans = self.config.rootSize,
            pathFlash = self.config.pathFlash,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            pathImage = self.config.pathImage;
            

        // var texture = ctx.createPattern(pathImage, "repeat");
        // ctx.strokeStyle = texture;
        ctx.strokeStyle="#6ba1d6";
        ctx.beginPath();
        ctx.moveTo(path[0].x,path[0].y);
        for(var i in path){
            ctx.lineTo(path[i].x,path[i].y);
        }
        ctx.lineWidth = 3;
        ctx.stroke();
        // if(path.startPoint==-1||path.endPoint==-1){ return; }
        // else{
        //     ctx.beginPath();
        //     ctx.moveTo(path.startPoint.x,path.startPoint.y);
        //     if(path.point2!=-1){
        //         ctx.lineTo(path.point2.x,path.point2.y);
        //     }
        //     if(path.point3!=-1){
        //         ctx.lineTo(path.point3.x,path.point3.y);
        //     }
        //     ctx.lineTo(path.endPoint.x,path.endPoint.y);
        //     //ctx.lineWidth = 3;
        //     ctx.stroke();
        // }    
    },
    drwaBoom: function(ctx, lastPoint,nowPoint) {
        var self = this;
        if(self.config.combo>8){
         self.config.combo=1;
        }
        var eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            boom = self.config.boom,
            combo=self.config.combo,
            trans = self.config.rootSize;

        $($(".boom")[0]).css({"top":+lastPoint.y+"px","left":+lastPoint.x+"px"});
        $($(".boom")[1]).css({"top":+nowPoint.y+"px","left":+nowPoint.x+"px"});
        //消除声音特效
        //self.config.eliminate5.play();
        switch(combo){
            case 1:
                self.config.eliminate1.play();
                break;
            case 2:
                self.config.eliminate2.play();
                break;
            case 3:
                self.config.eliminate3.play();
                break;
            case 4:
                self.config.eliminate4.play();
                break;
            case 5:
                self.config.eliminate5.play();
                break;
            case 6:
                self.config.eliminate6.play();
                break;
            case 7:
                self.config.eliminate7.play();
                break;
            case 8:
                self.config.eliminate8.play();
                break;
        }
        //$(".boom").css("top","20px");
        $(".boom").removeClass("hide");
        setTimeout(function(){
            $(".boom2").addClass("boom2-move");
            $(".boom1").addClass("boom1-move");
        },50);
        setTimeout(function(){
            $(".boom").addClass("hide");
            $(".boom2").removeClass("boom2-move");
            $(".boom1").removeClass("boom1-move");
        },300)
        //ctx.clearRect(ePoint.x,ePoint.y,);
        //setTimeout(function() {
            //ctx.scale(.7,.7);
            //ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans - 5, eHeight * trans - 5);
             //ctx.drawImage(boom,160,15,eWidth,eHeight,ePoint.x+eWidth*trans/4,ePoint.y+eHeight*trans/4,eWidth*trans/2,eHeight*trans/2);
            // ctx.drawImage(boom,160,15,eWidth,eHeight,ePoint.x+eWidth*trans/4,ePoint.y+eHeight*trans/4,eWidth*trans/2,eHeight*trans/2);
       // }, 250);
        // setTimeout(function(){
        //     ctx.clearRect(ePoint.x,ePoint.y,);
        //     ctx.scale(10/7,10/7);
        //     ctx.drawImage(boom,0,120,125,135,ePoint.x,ePoint.y,125*trans,125*trans);
        // },400);
    },
    drawCombo:function(ctx,combo,trans){
        var self=this;
        var sprite3=self.config.sprite3,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            y=15,//comob位置
            x=clientWidth-150,
            x1=x+125 * trans/3,//num位置
            y1=y+30,
            p=(combo-1)*30,
            validTime=self.config.validTime;
            // ctx.clearRect(x,y,125*trans*1.5,70*trans*1.5);
            // ctx.drawImage(sprite3, 0, 85, 125, 40, x, y, 125 * trans*1.5, 40 * trans*1.5);
            // ctx.drawImage(sprite3, 0, 40, 30, 35, x1, y1, 30 * trans*1.5, 35 * trans*1.5);
            // setTimeout(function(){
                ctx.clearRect(x,y,125*trans*1.5,70*trans*1.5);
                ctx.drawImage(sprite3, 0, 85, 125, 40, x, y, 125 * trans, 40 * trans);
                ctx.drawImage(sprite3, p, 40, 30, 35, x1, y1, 30 * trans, 35 * trans);
            //},500);
            clearTimeout(self.config.timer);
            self.config.timer=setTimeout(function(){
                ctx.clearRect(x,y,125*trans*1.5,70*trans*1.5);
                self.config.combo=0;
            },validTime);
    },
    drawScore:function(ctx,score,trans){
        var self=this;
        var sprite3=self.config.sprite3,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            y=35,//score位置
            x=clientWidth-210,
            num=[5,35,68,98,133,165,198,229,261,296];
        // var s=score.toString(),
        //     length=s.length();
        ctx.clearRect(x-32*trans*5,y,32*trans*5,40*trans);
        while(score>9){
            var n=score%10;
            score=Math.floor(score/10);
            ctx.drawImage(sprite3, num[n], 0, 32, 40, x, y, 32 * trans, 40 * trans);
            x=x-32*trans;
        }
        ctx.drawImage(sprite3, num[score], 0, 32, 40, x, y, 32 * trans, 40 * trans);
    },
    drawTime:function(ctx,time,trans){
        var self=this;
        var sprite3=self.config.sprite3,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            x=clientWidth-270,
            y=clientHeight-70,
            gameTime=self.config.gameTime;

        var width=(190/gameTime)*time,
            begin=198-width;
        ctx.clearRect(x,y,270*trans,70*trans);
        ctx.drawImage(sprite3, 210, 75, 60, 60, x, y, 70 * trans, 65 * trans);
        ctx.drawImage(sprite3, begin, 149, width, 25, x+70*trans, y+60*trans/3, width * trans, 25 * trans);
        setTimeout(function(){
            if(time>0){
                self.drawTime(ctx,time-1,trans);
            }else{//时间到了
                console.log("time UP!");
            }
        },1000);
    },
    //页面加载
    pageLoad: function(){
        var self = this;
        function Load(){}
        //图片，音乐加载
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
        //音乐加载
        Load.prototype.loadMusic = function(urls,callback) {
            this.urls = urls;
            this.musicNumbers = urls.length;
            this.loadMusicNumbers = 0;
            var that =this;
            for(var i=0;i<urls.length;i++){
                var obj = new Audio();
                obj.src = urls[i];
                obj.onloadedmetadata = function(){
                    that.loadMusicNumbers++;
                    callback(parseInt((that.loadMusicNumbers/that.musicNumbers)*100));
                }
            }
        };
        var loader=new Load();
        loader.loadImgs([self.config.sprite1.src,self.config.sprite2.src,self.config.sprite3.src,self.config.boom.src,'images/home.jpg','images/bg0.jpg','images/bg1.png','images/common1.png','images/home.jpg','images/home1.png','images/home1.jpg','images/grass.png'],function(percent){
                if(percent==100){//图片加载完后
                    loader.loadMusic([self.config.bgm1.src,self.config.bgm2.src,self.config.eliminate1.src,self.config.eliminate2.src,self.config.eliminate3.src,self.config.eliminate4.src,self.config.eliminate5.src,self.config.eliminate6.src,self.config.eliminate7.src,self.config.eliminate8.src,self.config.drop.src],function(percent){
                        if(percent==100){//音乐加载完后
                            $(".loading").addClass("hide");
                            $(".home-page").removeClass("hide");
                            self.initListener();
                        }
                    });
                }
        });
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