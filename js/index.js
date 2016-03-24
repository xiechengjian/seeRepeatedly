//struct point
function Point(x, y) {
    this.x = x;
    this.y = y;
} 
//struct Element
function Element(ePoint, mark, binaryPoint,alpha,status) { //元素的位置，和元素的标志,元素二进制图的位置
    this.ePoint = (ePoint != undefined) ? ePoint : new Point(0, 0); //通过元素标志判断是否为同一个元素
    this.mark = (mark != undefined) ? mark : -1;
    this.binaryPoint = (binaryPoint != undefined) ? binaryPoint : new Point(-1, -1);
    this.alpha = (alpha != undefined) ? alpha : 1;//默认透明度为1
    this.status = (status != undefined) ? status : 0;//默认状态0
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
        lightingSpeed:0.3,//闪电模式的速度
        lightingModeTimer:0,//闪电模式时间种子
        isLighting:0,//闪电数
        timer:0,//setTimeout,时间种子
        gameTimer:0,//游戏时间种子，暂停时间！！
        initMapTimer:0,//游戏地图刷新种子
        score:0,//计分
        gameMode:0,//0表示经典模式1表示闪电模式
        gameTime:60,//总的计时默认60s
        leftGameTime:60,//游戏当前剩余时间
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
        sound_score:new Audio(),
        sound_ready:new Audio(),
        drop:new Audio(),//点击音效
        start:false,
        checkPoint:0,//当前关卡数
        //闪电模式初始化地图6*7
        lightingInitMaps:[
            [ 
                [0, 5, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 2],
                [4, 3, 6, 0, 2, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 4, 0],
                [0, 3, 0, 0, 5, 4],
                [6, 4, 0, 0, 0, 0],
            ],
        ],
        //闪电地图,出现在闪电地图的位置Point
        lightingMaps:[
            
        ],
        //经典模式地图6*7
        classicMaps:[
            [   
                [4, 2, 6, 3, 5, 1],
                [0, 0, 0, 0, 0, 6],
                [0, 0, 0, 0, 0, 1],
                [4, 2, 4, 3, 4, 5],
                [4, 0, 0, 0, 0, 4],
                [1, 0, 0, 0, 0, 3],
                [6, 6, 4, 4, 3, 1],
            ],
            [
                [3, 2, 6, 3, 5, 1],
                [1, 0, 0, 0, 0, 6],
                [1, 0, 0, 0, 0, 1],
                [4, 2, 4, 3, 3, 5],
                [4, 0, 0, 0, 0, 4],
                [1, 0, 0, 0, 0, 3],
                [5, 5, 4, 4, 3, 1],
            ]
        ],
        //当前游戏二进制地图6*7 
        binaryMap: [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
        //当前游戏元素地图
        currentEMap:[
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
        items: [        //items在sprite中的微调校正
            [0,70, 140, 212, 283, 355, 428], //X轴校正
            [0,70, 145, 220, 287, 360, 430],//Y轴校正
        ],
        elementMap: [], //元素地图
        elementStart: new Point(50, 100),
        lastElement: new Element(),
        nowElement: new Element(),
    },
    //初始化
    init: function() {
        var self = this;
        self.config.rootSize = (parseFloat($('html').css('font-size')) / 100)-0.05;
        //if(self.config.rootSize<=0.5)self.config.rootSize-=0.05;
        self.config.clientWidth = document.documentElement.clientWidth;
        self.config.clientHeight = document.documentElement.clientHeight;
        $(".home-page").css('height',self.config.clientHeight+'px');
        $(".game-mode").css('height',self.config.clientHeight+'px');
        $(".gameBg").css('height',self.config.clientHeight+'px');
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
        self.config.sound_score.src="music/score.mp3";
        self.config.sound_ready.src="music/ready.mp3";
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
        var startY = self.config.elementStart.y,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth;
        self.config.bgm1.play();
        self.config.bgm1.loop=true;
        self.config.bgm2.loop=true;
        //首页监听事件，点击进入模式选择
        $(".home-page").on('click',function(e){
            //self.config.bgm1.pause();
            e.preventDefault();
            $(".home-page").addClass("hide");
            $(".game-mode").removeClass("hide");
        });
        //模式选择监听事件，选择两种模式
        //经典模式
        $(".classic-mode").on('touchstart',function(e){
            e.preventDefault();
            self.classicMode(ctx);
        });
        //闪电模式
        $(".lighting-mode").on('touchstart',function(e){
            e.preventDefault();
            self.lightingMode(ctx);
           
        })
        //暂停按钮
        $(".pauseBtn").on('click',function(){
            $(".mask").removeClass("hide");
            $(".pausePanel").removeClass("hide");
            self.config.bgm2.pause();
            clearInterval(self.config.gameTimer);
            if(self.config.gameMode){
                clearInterval(self.config.lightingModeTimer);
            }
             
        });
        //返回游戏界面
        $(".returnGame").on('touchstart',function(){
            $(".mask").addClass("hide");
            $(".pausePanel").addClass("hide");
            self.config.bgm2.play();
            var time=self.config.leftGameTime,
                trans=self.config.rootSize;
            self.drawTime(ctx,time,trans);
            if(self.config.gameMode){
                self.config.lightingModeTimer=setInterval(function(){
                    self.addNewElement(2);
            },4000)
            }

        });
        //退出当前游戏模式
        $(".outGame").on('touchstart',function(){
            //清空当前游戏状态
            if(!$(".scorePanel").hasClass("hide")){
                $(".scorePanel").addClass("hide");
            }
            if(!$(".pausePanel").hasClass("hide")){
                $(".pausePanel").addClass("hide");
            }
            $(".score").empty();
            $(".start").removeClass("start-left");
            $(".start").removeClass("start-right");
            $(".mask").addClass("hide");
            $(".gameBg").addClass("hide");
            $(".game-mode").removeClass("hide");
            self.config.start=false;
            clearInterval(self.config.initMapTimer);
            ctx.clearRect(0,0,clientWidth,clientHeight);
            if(self.config.gameMode){
                clearInterval(self.config.lightingModeTimer);
            }
            
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
        });
    },
    //元素地图初始化,bmap二进制地图
    initMap: function(ctx,bMap) {
        var self = this;
        var eMap = [], //元素地图
            startP = self.config.elementStart,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            trans = self.config.rootSize;
        //清屏
        ctx.clearRect(0,startY-(eHeight*trans)/2-5,clientWidth,clientHeight-150);
        //self.config.lastElement=new Element();
        //self.config.nowElement=new Element();
        for (var i = 0; i < 7; i++) {
            for (var j = 0; j < 6; j++) {
                if (bMap[i][j]) {
                    //元素的位置，和标志,透明度，状态
                    var ePoint = bMap[i][j].ePoint,
                        alpha=bMap[i][j].alpha,
                        mark = bMap[i][j].mark,
                        status=bMap[i][j].status;
                    if(alpha<1){
                        alpha+=self.config.lightingSpeed;
                        bMap[i][j].alpha+=self.config.lightingSpeed;
                        setTimeout(function(){
                            self.config.isLighting=false;
                        },2000);
                        //self.config.currentEMap[i][j].alpha+=0.2;
                    }else{
                        alpha=1;
                        bMap[i][j].alpha=1;
                        //
                        //self.config.currentEMap[i][j].alpha=1;
                        eMap.push(bMap[i][j]);
                    }
                    //itmes的位置
                    //闪电模式的items
                    if(self.config.gameMode){
                        //随机的items
                        var it=2;
                        if(mark>7){
                            mark-=7;
                            it=3;
                        }
                        var iPoint = new Point(self.config.items[0][mark - 1], self.config.items[1][it]);
                    }else{
                        var iPoint = new Point(self.config.items[0][mark - 1], 0);
                    }
                    //画元素
                    self.drawElement(ctx, ePoint, iPoint,alpha,status,mark);
                }
            }
        }
        self.config.start=true;
        self.config.elementMap.length=0;//元素地图重新赋值
        self.config.elementMap=eMap;
        //没有元素了，赢了
        if(!eMap.length&&!self.config.isLighting){
            //console.log("赢了！");
            switch(self.config.gameMode){
                case 0://经典模式
                //还有关卡，就继续下一个地图
                self.config.checkPoint++;
                var checkPoint=self.config.checkPoint,
                classicMaps=self.config.classicMaps;
                if(checkPoint<classicMaps.length){
                    var temp=self.config.classicMaps[checkPoint];
                    for(var i=0;i<temp.length;i++){
                        for(var j=0;j<temp[i].length;j++){
                            if(temp[i][j]){
                                self.config.binaryMap[i][j]=temp[i][j];
                                var ePoint = new Point(startX + (eWidth * trans - 5) * j, startY + (eHeight * trans - 5) * i),
                                    mark=temp[i][j],
                                    binaryPoint = new Point(j, i),
                                    alpha = 1,
                                    status = 0,
                                    element = new Element(ePoint, mark, binaryPoint,alpha,status);
                                self.config.currentEMap[i][j]=element;
                            }
                        }
                    }
                    // var bMap = self.config.currentEMap;//二进制地图
                    //     //经典模式地图初始化
                    //     self.config.start=false;
                    //     setTimeout(function(){
                    //         self.initMap(ctx,bMap);
                    //     },1000);
                }else{
                    clearInterval(self.config.initMapTimer);
                    self.gameOver(self.config.score);
                    return ;
                }
                break;
                case 1://闪电模式
                    clearInterval(self.config.lightingModeTimer);
                    clearInterval(self.config.initMapTimer);
                    self.gameOver(self.config.score);
                break;
            }
        }
        return eMap;
    },
    //游戏刷新
    gameRefresh:function(){
        var self = this;
        var eMap = [], //元素地图
            startP = self.config.elementStart,
            startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            clientHeight=self.config.clientHeight,
            clientWidth=self.config.clientWidth,
            trans = self.config.rootSize;
        //清屏
        ctx.clearRect(0,startY-(eHeight*trans)/2-5,clientWidth,clientHeight-150);
        self.config.lastElement=new Element();
        self.config.nowElement=new Element();
    },
    //画连连看基本元素isAlpah是否透明,status元素状态,mark 为items
    drawElement: function(ctx, ePoint, iPoint,alpha,status,mark) { //ePoint元素位置 iPoint是items在sprite的定位
        var self = this;
        ctx.globalAlpha=alpha;
        var eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            sprite2 = self.config.sprite2,
            sprite1 = self.config.sprite1,
            trans = self.config.rootSize,
            eMap = self.config.elementMap,
            items=self.config.items;
        ctx.clearRect(ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
        ctx.drawImage(sprite2, 7, 7, eWidth, eHeight, ePoint.x, ePoint.y, eWidth * trans, eHeight * trans);
        if(!self.config.start){
            setTimeout(function() {
            self.elementSreversal(ctx, ePoint, iPoint);
            }, 300);
        }else{
            if(!status){//默认状态，即为未点击状态
                ctx.drawImage(sprite1, iPoint.x, iPoint.y, 70, 70, ePoint.x, ePoint.y + 2, 70 * trans, 70 * trans);
            }else{
                var eX=ePoint.x,eY=ePoint.y;
                ctx.clearRect(eX, eY, eWidth * trans - 5, eHeight * trans - 5);
                ctx.drawImage(sprite2, 98, 5, 75, 95, eX, eY, 75 * trans, 95 * trans);
                 if(self.config.gameMode){
                    var it=2;
                        if(mark>7){
                            mark-=7;
                            it=3;
                    }
                     ctx.drawImage(sprite1, iPoint.x, iPoint.y, 70, 70, eX + 1, eY + 3, 70 * trans, 70 * trans);
                 }else{
                    ctx.drawImage(sprite1, items[0][mark-1]+5, 435, 70, 70, eX + 4, eY + 5, 70 * trans, 70 * trans);
                }
            }
            
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
                //点中元素
            if (x > eX && x < eX + eWidth * trans && y > eY && y < eY + eHeight * trans) {
                if(now.mark==-1){
                    self.config.drop.play();
                }
                if (eMap[i] == last || eMap[i] == now) return;
                //清除上一个element，并重绘
                var now_x=eMap[i].binaryPoint.x,now_y=eMap[i].binaryPoint.y;
                self.config.currentEMap[now_y][now_x].status=1;
                var last_x=last.binaryPoint.x,last_y=last.binaryPoint.y;
                if(last_x!=-1){
                    self.config.currentEMap[last_y][last_x].status=0;
                }
                // if (last.mark != -1 && last != eMap[i] && now != eMap[i] && last != now) {
                //     ctx.clearRect(last.ePoint.x, last.ePoint.y, eWidth * trans - 5, eHeight * trans - 5);
                //     ctx.drawImage(sprite2, 7, 7, eWidth - 8, eHeight - 8, last.ePoint.x, last.ePoint.y, (eWidth - 8) * trans, (eHeight - 8) * trans);
                //     ctx.drawImage(sprite1,items[0][last.mark-1], 0, 70, 70, last.ePoint.x, last.ePoint.y + 2, 70 * trans, 70 * trans);
                // }
                // //点击换新的element items[0][eMap[i].mark-1]
                // ctx.clearRect(eX, eY, eWidth * trans - 5, eHeight * trans - 5);
                // ctx.drawImage(sprite2, 98, 5, 75, 95, eX, eY, 75 * trans, 95 * trans);
                // ctx.drawImage(sprite1, items[0][eMap[i].mark-1]+5, 435, 70, 70, eX + 4, eY + 5, 70 * trans, 70 * trans);
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
                        self.config.currentEMap[last.binaryPoint.y][last.binaryPoint.x]=0;
                        self.config.currentEMap[now.binaryPoint.y][now.binaryPoint.x]=0;
                        self.config.lastElement=new Element();
                        self.config.nowElement=new Element();
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
                            //绘制combo
                            self.drawCombo(ctx,self.config.combo,trans);
                        }
                        
                        //计分！！统计
                        var comboScore=0;
                        if(combo){
                            comboScore=(self.config.combo-1)*150;
                        }
                        score=score+100+comboScore;
                        self.config.score=score;
                        self.drawScore(ctx,score,trans);
                        
                        // setTimeout(function(){
                        //     var bMap = self.config.currentEMap;//二进制地图
                        //     self.initMap(ctx,bMap);
                        // },50);
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
                self.config.eliminate1.load();
                self.config.eliminate1.play();
                break;
            case 2:
                self.config.eliminate2.load();
                self.config.eliminate2.play();
                break;
            case 3:
                self.config.eliminate3.load();
                self.config.eliminate3.play();
                break;
            case 4:
                self.config.eliminate4.load();
                self.config.eliminate4.play();
                break;
            case 5:
                self.config.eliminate5.load();
                self.config.eliminate5.play();
                break;
            case 6:
                self.config.eliminate6.load();
                self.config.eliminate6.play();
                break;
            case 7:
                self.config.eliminate7.load();
                self.config.eliminate7.play();
                break;
            case 8:
                self.config.eliminate8.load();
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
            p=(combo-1)*29.5,
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
        ctx.globalAlpha=1;
        var width=(190/gameTime)*time,
            begin=198-width;
        ctx.clearRect(x,y,270*trans,70*trans);
        ctx.drawImage(sprite3, 210, 75, 60, 60, x, y, 70 * trans, 65 * trans);
        ctx.drawImage(sprite3, begin, 149, width, 25, x+70*trans, y+60*trans/3, width * trans, 25 * trans);
        self.config.gameTimer=setTimeout(function(){
            //
            if(time>0){
                self.config.leftGameTime--;
                self.drawTime(ctx,time-1,trans);
            }else{//时间到了
                //console.log("time UP!");
                $(".mask").removeClass("hide");
                $(".timeUp").addClass("timeUp-move");
                setTimeout(function(){
                    $(".mask").addClass("hide");
                    $(".timeUp").removeClass("timeUp-move");
                    clearInterval(self.config.initMapTimer);
                    self.gameOver(self.config.score);
                },1000);
            }
        },1000);
    },
    //闪电模式
    lightingMode:function(ctx){
        var self=this;
        self.config.gameMode=1;//闪电模式
            self.config.gameTime=60;
            self.config.leftGameTime=60;
            self.config.score=0;
            self.config.combo=0;
            self.config.bgm1.pause();
            self.config.bgm2.load();
            // self.config.bgm1.load();
            //ctx.globalAlpha = 0.2;
            self.config.bgm2.play();
            self.initGame(ctx,0,self.config.lightingInitMaps);
            setTimeout(function(){
              self.config.lightingModeTimer=setInterval(function(){
                    self.addNewElement(2);
               },1500) 
            },3000);
               
    },
    //经典模式
    classicMode:function(ctx){
        var self=this;
        self.config.gameMode=0;
            self.config.checkPoint=0;
            var point=self.config.checkPoint;
            self.config.gameTime=60;
            self.config.leftGameTime=60;
            self.config.score=0;
            self.config.combo=0;
            self.config.bgm1.pause();
            self.config.bgm2.load();
            // self.config.bgm1.load();
            self.config.bgm2.play();
            self.initGame(ctx,point,self.config.classicMaps);
    },
    //游戏结束
    gameOver:function(score){
        var self=this,
            i=0;
        self.config.bgm2.pause();
        $(".mask").removeClass("hide");
        $(".scorePanel").removeClass("hide");
        clearInterval(self.config.gameTimer);
        self.config.sound_score.play();
        self.config.start=false;
        setTimeout(function(){
            var timer=setInterval(function(){
                if(i<=score){
                    $(".score").empty();
                    $(".score").append(i);
                    i=i+50;
                }else{
                    clearInterval(timer);
                    self.config.sound_score.pause();
                }
            },1);
        },1000);
    },
    //游戏初始化
    initGame:function(ctx,checkPoint,Maps){
        var self=this;
        var startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            trans = self.config.rootSize;
        $(".game-mode").addClass("hide");
        $(".gameBg").removeClass("hide");
        $(".scorePanel").addClass("hide");
        $(".mask").removeClass("hide");
            //self.config.binaryMap.length=0;        
            //游戏模式初始化
            var temp=Maps[checkPoint];//选择地图
            for(var i=0;i<temp.length;i++){
                for(var j=0;j<temp[i].length;j++){
                    if(temp[i][j]){
                        self.config.binaryMap[i][j]=temp[i][j];
                        var ePoint = new Point(startX + (eWidth * trans - 5) * j, startY + (eHeight * trans - 5) * i),
                            mark=temp[i][j],
                            binaryPoint = new Point(j, i),
                            alpha = 1,
                            status = 0,
                            element = new Element(ePoint, mark, binaryPoint,alpha,status);
                        self.config.currentEMap[i][j]=element;
                    }else{
                        self.config.binaryMap[i][j]=0;
                        self.config.currentEMap[i][j]=0;
                    }
                }
            }

            setTimeout(function(){ 
                self.config.sound_ready.load();
                self.config.sound_ready.play(); 
                $(".start").addClass("start-left");
            },500);
            //显示开始！提示句，1.5s后开始游戏
            setTimeout(function(){
                $(".mask").addClass("hide");
                $(".start").addClass("start-right");
                self.config.sound_ready.pause();
                var bMap = self.config.currentEMap;//二进制地图
                //经典模式地图初始化
                self.initMap(ctx,bMap);
                setTimeout(function(){
                    self.config.initMapTimer=setInterval(function(){
                        self.initMap(ctx,bMap);
                    },50);
                },1000);
                var time=self.config.gameTime,
                    trans=self.config.rootSize;
                self.drawTime(ctx,time,trans);
            },2000);
            //self.gameOver(10000);
    },
    //闪电模式添加n个新的元素
    addNewElement:function(n){
        if(n==0){
            self.config.isLighting=true;
            return;
        }
        var self=this;
        var startX = self.config.elementStart.x,
            startY = self.config.elementStart.y,
            eHeight = self.config.elementHeight,
            eWidth = self.config.elementWidth,
            trans = self.config.rootSize;
        var temp=self.config.binaryMap,
            map=[];
        ////当前地图有可插入位置存入map中
        for(var i=0;i<temp.length;i++){
            for(var j =0 ;j<temp[i].length;j++){
                if(!temp[i][j]){
                    var point=new Point(i,j);
                    map.push(point);
                }
            }
        }
        //没有可插入的位置
        if(!map.length){
            return;
        }
        var p1=0,p2=p1;//随机生成map中的两个位置
        while(p1==p2||p1>=map.length||p2>=map.length){
            p1=Math.floor(Math.random()*map.length);
            p2=Math.floor(Math.random()*map.length);
        }
        var x1=map[p1].x,//两个binaryMap中的位置
            y1=map[p1].y,
            x2=map[p2].x,
            y2=map[p2].y;
        if(!temp[x1][y1]&&!temp[x2][y2]){//当前地图有可插入位置
            //在当前地图中插入两个元素
            var m=Math.floor(1+Math.random()*14);//mark随机
                var ePoint = new Point(startX + (eWidth * trans - 5) * y1, startY + (eHeight * trans - 5) * x1),
                            mark=m,
                            binaryPoint = new Point(y1, x1),
                            alpha = 0,//透明度默认为0
                            status = 0,//默认状态为0
                            element = new Element(ePoint, mark, binaryPoint,alpha,status);
                self.config.currentEMap[x1][y1]=element;
                var ePoint = new Point(startX + (eWidth * trans - 5) * y2, startY + (eHeight * trans - 5) * x2),
                            mark=m,
                            binaryPoint = new Point(y2, x2),
                            alpha = 0,
                            status = 0,
                            element = new Element(ePoint, mark, binaryPoint,alpha,status);
                self.config.currentEMap[x2][y2]=element;
            self.config.binaryMap[x1][y1]=10;
            self.config.binaryMap[x2][y2]=10;
            //self.config.lightingMaps.push(obj1);
            self.addNewElement(n-1);
        }else{
            self.addNewElement(n);
        }
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
                //if(obj.src){
                var u=navigator.userAgent;
                var and= u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
                if(and){
                    //console.log("Android");
                    setTimeout(function(){
                        $(".loading").addClass("hide");
                        $(".home-page").removeClass("hide");
                        self.initListener();
                    },3000);
                    return;
                }else{
                    obj.onloadedmetadata = function(){
                        that.loadMusicNumbers++;
                        callback(parseInt((that.loadMusicNumbers/that.musicNumbers)*100));
                    }
                }
            }
        };
        var loader=new Load();
        loader.loadImgs([self.config.sprite1.src,self.config.sprite2.src,self.config.sprite3.src,self.config.boom.src,'images/home.jpg','images/bg0.jpg','images/bg1.png','images/common1.png','images/home.jpg','images/home1.png','images/home1.jpg','images/grass.png'],function(percent){
                if(percent==100){//图片加载完后
                    loader.loadMusic([self.config.bgm1.src,self.config.sound_ready.src,self.config.bgm2.src,self.config.eliminate1.src,self.config.eliminate2.src,self.config.eliminate3.src,self.config.eliminate4.src,self.config.eliminate5.src,self.config.eliminate6.src,self.config.eliminate7.src,self.config.eliminate8.src,self.config.drop.src,self.config.sound_score.src],function(percent){
                        if(percent==100){//音乐加载完后
                            setTimeout(function(){
                                $(".loading").addClass("hide");
                                $(".home-page").removeClass("hide");
                                self.initListener();
                            },3000);
                            
                        }
                    });
                }
        });
    }
});
new Action().init();


