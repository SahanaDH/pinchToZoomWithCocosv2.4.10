// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;
var pos,oldpos
@ccclass
export default class NewClass extends cc.Component {



    @property(cc.Node)
    public map: cc.Node = null;

    @property(cc.Label)
    public scaleTime: cc.Label = null;

    public defaultScaling: number = 1.1;

    public minScale: number = 1;

    public maxScale: number = 6;

    public moveOffset: number = 2;

    public increaseRate: number = 10000;

    public locked: boolean = false; // Operation lock
    private isMoving: boolean = false; // Whether to drag the map
    public singleTouchCb: Function = null; // Click callback function

    private zoomFlag = true; //to enable zoomscale func
    private lastDistance = new cc.Vec2(0, 0); //store dist between two touches
    private currentDistance = new cc.Vec2(0,0);
    private distanceOffset = 50; //tolerance of the distance difference

    protected start() {
        // macro.ENABLE_MULTI_TOUCH = true;

        this.addEvent();
        // this.smoothOperate(this.map, new cc.Vec3(0,0,0), new cc.Vec3(this.defaultScaling,this.defaultScaling,this.defaultScaling));
    }

    // Some devices are too sensitive for a single point, and a single point operation will trigger the TOUCH_MOVE callback, where the error value is judged
    private canStartMove(touch: any): boolean {
        let startPos: cc.Vec3 = touch.getStartLocation();
        let nowPos: cc.Vec3 = touch.getLocation();
        return (Math.abs(nowPos.x - startPos.x) > this.moveOffset
            || Math.abs(nowPos.y - startPos.y) > this.moveOffset);

    }

    private compareDistance(dist1,dist2){
        // console.log(dist1,dist2,"nowwwwwwww.............................distanceOffset",Math.abs(dist1.x - dist2.x),Math.abs(dist1.y - dist2.y));
        
        return (Math.abs(dist1.x - dist2.x) > this.distanceOffset
            || Math.abs(dist1.y - dist2.y) > this.distanceOffset);
    }

    private addEvent() {
        let self = this;
        let startY = 0;

// Event listener for touch start
this.node.on('touchstart', (event) => {
  // Get the initial vertical position of the touch
  let touches: any[] = event.getTouches(); // Get all touch points
   console.log(touches);
   
   var touch1 = touches[0].clientY;

  startY = touch1;
  console.log(startY,touches,touch1,"start in toucg start");
  
});


        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event: any) {
            if (self.locked) return;

            let touches: any[] = event.getTouches(); // Get all touch points
            if (touches.length >= 2) {
                // multi touch
                console.log("multi");
                
                self.isMoving = true;
                
                var touch1 = touches[0],
                touch2 = touches[1];
                var delta1 = touch1.getDelta();
                var delta2 = touch2.getDelta();
                var touchPoint1: cc.Vec2 = self.map.convertToNodeSpaceAR(touch1.getLocation());
                var touchPoint2: cc.Vec2 = self.map.convertToNodeSpaceAR(touch2.getLocation());
                
                let midPoint = self.map.convertToNodeSpaceAR(touch1.getLocation().add(touch2.getLocation()).div(2));
                
                
                var distance: cc.Vec2 = touchPoint1.sub(touchPoint2);
                self.currentDistance = distance;
                var delta: cc.Vec2 = delta1.sub(delta2);
                var scale = 1;
                if (Math.abs(distance.x) > Math.abs(distance.y)) {
                    scale = (distance.x + delta.x) / distance.x * self.map.scale;
                } else {
                    scale = (distance.y + delta.y) / distance.y * self.map.scale;
                }
                
                // let scale = (self.map.scale + (midPoint.y / self.increaseRate));
                // if(self.anotherflag){
                // pos = touchPoint2.add(cc.v2(distance.x / 2, distance.y / 2));// to finding midpoint
                // oldpos = pos
                // console.log("bef",self.anotherflag);
                
                // self.anotherflag = false;
                // console.log("aft",self.anotherflag);
                
                // }
                // if(!self.anotherflag){
                //     pos = oldpos
                // }
                //     console.log(pos,self.anotherflag,oldpos,"same as midpoint or what");
                
                // console.log(pos,scale,delta,midPoint,distance,touchPoint1,touchPoint2,"pos scale delta,mid,dist,touch1,tiouch2");
                // self.smoothOperate(self.map, midPoint, new cc.Vec3(scale,scale));
                if(self.zoomFlag){
                    pos = touchPoint2.add(cc.v2(distance.x / 2, distance.y / 2));
                    self.smoothOperate(self.map, pos, new cc.Vec3(scale,scale));
                    self.zoomFlag = false;
                    self.lastDistance = self.currentDistance;
                }

                else if(self.compareDistance(self.currentDistance,self.lastDistance)){
                    pos = touchPoint2.add(cc.v2(distance.x / 2, distance.y / 2));
                    
                    self.smoothOperate(self.map, pos, new cc.Vec3(scale,scale));
                    // console.log("when can this happen",self.currentDistance,self.lastDistance);

                }
                // else if(self.currentDistance > self.lastDistance || self.currentDistance < self.lastDistance){
                //     self.smoothOperate(self.map, pos, new cc.Vec3(scale,scale));
                //     console.log("here",self.currentDistance,self.lastDistance);  
                //     console.log(self.currentDistance > self.lastDistance,self.currentDistance < self.lastDistance,"*****************************");
                                    
                // }

                else{
                    // console.log("when it is here------------------>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<------------");
                    
                    self.dealMove(touches[0].getDelta(), self.map, self.node);
                }
            }
            else if (touches.length === 1) {
                // single touch
                if (self.isMoving || self.canStartMove(touches[0])) {
                    self.isMoving = true;
                    self.dealMove(touches[0].getDelta(), self.map, self.node);
                }
            }
        });

        this.node.on(cc.Node.EventType.TOUCH_END, function (event: any) {
            if (self.locked) return;
                        self.zoomFlag = true;
            if (event.getTouches().length <= 1) {
                if (!self.isMoving) {
                    let worldPos: cc.Vec3 = event.getLocation();
                    let nodePos: cc.Vec3 = self.map.convertToNodeSpaceAR(new cc.Vec3(worldPos.x,worldPos.y,0));
                    self.dealSelect(nodePos);
                }
                self.isMoving = false; // Reset the mobile flag when there is only the last touch point in the container
            };
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event: any) {
            if (self.locked) return;

            // self.zoomFlag = true;
            if (event.getTouches().length <= 1) { // When there is only the last touch point in the container, the mobile flag is restored
                self.isMoving = false;
            }
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_WHEEL, function (event: any) {
            if (self.locked) return;

            let worldPos: cc.Vec3 = event.getLocation();
            let scrollDelta: number = event.getScrollY();
            console.log(event.getScrollY(),"scrollY");
            
            let scale: number = (self.map.scale + (scrollDelta / self.increaseRate));

            let target: cc.Node = self.map;
            let pos: cc.Vec3 = target.convertToNodeSpaceAR(new cc.Vec3(worldPos.x,worldPos.y,0));
            self.smoothOperate(target, pos, new cc.Vec3(scale,scale,0));
        }, this);
        
    //     this.node.on("touchmove", (event: cc.Event.EventTouch) => {
    //         console.log("ppppppppppppppppppppppppppp");
            
    //         var touches = event.getTouches();

    //         if (touches.length > 1) {
    //             if (self.locked) return;console.log("llllllllllllllllllllllll");
                
           
    //             var touch1 = touches[0],
    //             touch2 = touches[1];
    //             var delta1 = touch1.getDelta();
    //             var delta2 = touch2.getDelta();

    //             var touchPoint1: cc.Vec2 = self.map.convertToNodeSpaceAR(touch1.getLocation());
    //             var touchPoint2: cc.Vec2 = self.map.convertToNodeSpaceAR(touch2.getLocation());

    //             let worldPos = event.getLocation();
    //             let midPoint = touchPoint1.sub(touchPoint2).div(2);
    //             let scrollDelta = midPoint;




    // touchendX = event.changedTouches[0].screenX;
    // scrollContainer.scrollLeft += touchstartX - touchendX;


    //             // var distance: cc.Vec2 = touchPoint1.sub(touchPoint2);
    //             // var delta: cc.Vec2 = delta1.sub(delta2);
    //             // var scale = 1;
    //             // if (Math.abs(distance.x) > Math.abs(distance.y)) {
    //             //     scale = (distance.x + delta.x) / distance.x * this.map.scale;
    //             // } else {
    //             //     scale = (distance.y + delta.y) / distance.y * this.map.scale;
    //             // }

    //             let scale = (self.map.scale + (scrollDelta.y / self.increaseRate));
    
    //         console.log(self.map.scale,scrollDelta,self.increaseRate,self.map.scale + (scrollDelta.y / self.increaseRate),scale,"scale");
            
    //             let pos: cc.Vec3 = self.map.convertToNodeSpaceAR(new cc.Vec3(worldPos.x,worldPos.y,0));
    //             self.smoothOperate(self.map, midPoint, new cc.Vec3(scale,scale,0));

    //         }
    //     },this);
    }

    private smoothOperate(target: cc.Node, pos, scale: cc.Vec3) {
        // Zoom in
        if (this.minScale <= scale.x && scale.x <= this.maxScale) {
            // The difference between the current zoom value and the original zoom value
            let deltaScale: number = scale.x - target.scale;
            // The difference between the current click coordinate and the zoom value
            let gapPos: cc.Vec3 = pos.multiplyScalar(deltaScale);
            // The current node coordinate position minus the click coordinate and zoom value
            let mapPos: cc.Vec3 = target.position.subtract(gapPos);
            let num =  Math.floor(scale.x * 100) / 100;
            target.scale = num;
            // console.log(deltaScale,gapPos,mapPos,"delta,gap,map");
            
            this.dealScalePos(mapPos, target);
        }
        else {
            scale = scale.clampf(new cc.Vec3(this.minScale,this.minScale,this.minScale),new cc.Vec3(this.maxScale,this.maxScale,this.maxScale));
        }
        // Update label Display
        // console.log(`${Math.floor(scale.x * 100)}`,"scale************");
        
        this.scaleTime.string = `${Math.floor(scale.x * 100)}%`;
    }

    private dealScalePos(pos: cc.Vec3, target: cc.Node) {
        if (target.scale === 1) {
            pos = new cc.Vec3(0, 0, 0);
        }
        else {
            let worldPos: cc.Vec3 = this.node.convertToWorldSpaceAR(pos);
            let nodePos: cc.Vec3 = this.node.convertToNodeSpaceAR(new cc.Vec3(worldPos.x,worldPos.y,0));
            let edge: any = this.calculateEdge(target, this.node, nodePos);
            if (edge.left > 0) {
                pos.x -= edge.left;
            }
            if (edge.right > 0) {
                pos.x += edge.right;
            }
            if (edge.top > 0) {
                pos.y += edge.top;
            }
            if (edge.bottom > 0) {
                pos.y -= edge.bottom;
            }
        }
        target.position = pos;
    }

    private dealMove(dir: cc.Vec3, map: cc.Node, container: cc.Node) {
        let worldPos: cc.Vec3 = map.convertToWorldSpaceAR(new cc.Vec3(0, 0, 0));
        let nodePos: cc.Vec3 = container.convertToNodeSpaceAR(new cc.Vec3(worldPos.x,worldPos.y,0));
        nodePos.x += dir.x;
        nodePos.y += dir.y;
        let edge: any = this.calculateEdge(map, container, nodePos);
        let x = map.position.x;
        let y = map.position.y;
        if (edge.left <= 0 && edge.right <= 0) {
             x = map.position.x + dir.x;
            // console.log(num,'>>>++++++')
            // map.x += dir.x;
        }
        if (edge.top <= 0 && edge.bottom <= 0) {
            y = map.position.y + dir.y;
            // map.y += dir.y;
        }
        map.setPosition(x,y)
    }

    private dealSelect(nodePos: cc.Vec3) {
        cc.log(`click map on (${nodePos.x}, ${nodePos.y})`);
        // do sth
        if (this.singleTouchCb) this.singleTouchCb(nodePos);
    }

    // Calculate the distance between the four sides of the map and the container, if it is negative, it means it is beyond the map
    public calculateEdge(target: cc.Node, container: cc.Node, nodePos: cc.Vec3): any {
        // distance to the edge when anchor is (0.5, 0.5)
        let horizontalDistance: number = (container.width - target.width * target.scale) / 2;
        let verticalDistance: number = (container.height - target.height * target.scale) / 2;

        let left: number = horizontalDistance + nodePos.x;
        let right: number = horizontalDistance - nodePos.x;
        let top: number = verticalDistance - nodePos.y;
        let bottom: number = verticalDistance + nodePos.y;

        return { left, right, top, bottom };
    }


}
