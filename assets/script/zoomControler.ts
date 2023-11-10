const { ccclass, property } = cc._decorator;

@ccclass
export default class ZoomController extends cc.Component {
    tempSprite: cc.Node = undefined;
    anchorNode: cc.Node = undefined;

    currAnchorPoint: cc.Vec2;
    prevAnchorPoint: cc.Vec2;

    minZoom: number = 1;
    maxZoom: number = 5;

    initSpritePos: cc.Vec2;
    touchFlag = false;
    pointsDis: any;

    initialize(tempSprite, anchorNode) {
        let isAnchor = true;
        let totalTouch = 0;

        this.tempSprite = tempSprite;
        this.anchorNode = anchorNode;

        this.initSpritePos = this.tempSprite.getPosition();

        this.resetAnchor(this.tempSprite);
        this.tempSprite.on("touchstart", (event) => {
            totalTouch += 1;
        });

        this.tempSprite.on("touchmove", (event: cc.Event.EventTouch) => {
            var touches = event.getTouches();
            if (touches.length >= 2) {
                // console.log(touches,"double touch");
                
                this.touchFlag = true;
                var touch1 = touches[0],
                    touch2 = touches[1];
                var delta1 = touch1.getDelta();
                var delta2 = touch2.getDelta();
                var touchPoint1: cc.Vec2 = this.tempSprite.convertToNodeSpaceAR(touch1.getLocation());
                var touchPoint2: cc.Vec2 = this.tempSprite.convertToNodeSpaceAR(touch2.getLocation());

                if (isAnchor) {//anchor is set at start of the pinch by getting the midpoint from 2 finger
                    let midPoint = touch1.getLocation().add(touch2.getLocation()).div(2);
                    this.setAnchorPointToPos(this.tempSprite, midPoint);
                    isAnchor = false;
                }

                var distance: cc.Vec2 = touchPoint1.sub(touchPoint2);
                var delta: cc.Vec2 = delta1.sub(delta2);
                var scale = 1;
                if (Math.abs(distance.x) > Math.abs(distance.y)) {
                    scale = (distance.x + delta.x) / distance.x * this.tempSprite.scale;
                } else {
                    scale = (distance.y + delta.y) / distance.y * this.tempSprite.scale;
                }

                this.tempSprite.scale = Math.min(Math.max(this.minZoom, scale), this.maxZoom);
                this.touchFlag = false;


            }
            else if (touches.length == 1 ) {
        //         console.log("wwwwwwwwwwwwwwwwwwwwwwww");
                
        //         isAnchor = false
        //         this.tempSprite.setAnchorPoint(0.5, 0.5);
        //         this.tempSprite.setPosition(this.initSpritePos);
        //         this.resetAnchor(this.tempSprite);
        //         // console.log(touches,"single touch");
        //         let delta = event.getDelta();
                this.moveSprite(event);
        // this.dealMove(delta,this.tempSprite,this.tempSprite.parent);

            }
        });
        this.tempSprite.on("touchend", (event) => {
            totalTouch -= 1;
            if (totalTouch === 0) {
                isAnchor = true;
                this.resetAnchor(this.tempSprite);
            }

            if (this.tempSprite.scale === this.minZoom) {
                this.tempSprite.setAnchorPoint(0.5, 0.5);
                this.tempSprite.setPosition(this.initSpritePos);
                this.resetAnchor(this.tempSprite);
            }
            this.touchFlag = true;
        });


    }

    moveSprite(event) {
        // console.log(event,"here");
        
        // One finger is moving, and touchflag true after two touches, so move the image acc. to finger movement
        let delta = event.getDelta();
        console.log(delta.x,delta.y,"delta");
        
        // this.tempSprite.setPosition(this.tempSprite.position.add(delta));
        // this.resetNodePos(this.tempSprite)
        //  this.resetAnchor(this.tempSprite)
        // // this.setAnchorPointToPos(this.tempSprite,delta)
        this.tempSprite.setAnchorPoint(0.5, 0.5);
        this.tempSprite.setPosition(this.initSpritePos);
        // this.resetAnchor(this.tempSprite);
        this.restrictPic();
        this.dealMove(delta,this.tempSprite,this.tempSprite.parent);
    }

     dealMove(dir, map: cc.Node, container: cc.Node) {
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
            map.x += dir.x;
            console.log("here 1");
            
        }
        if (edge.top <= 0 && edge.bottom <= 0) {
            y = map.position.y + dir.y;
            map.y += dir.y;
            console.log("here 2");

        }
        map.setPosition(x,y);
        console.log(map.position,"sssssssssssssssss");
        
    }
    // Calculate the distance between the four sides of the map and the container, if it is negative, it means it is beyond the map
     calculateEdge(target: cc.Node, container: cc.Node, nodePos: cc.Vec3): any {
        // distance to the edge when anchor is (0.5, 0.5)
        let horizontalDistance: number = (container.width - target.width * target.scale) / 2;
        let verticalDistance: number = (container.height - target.height * target.scale) / 2;

        let left: number = horizontalDistance + nodePos.x;
        let right: number = horizontalDistance - nodePos.x;
        let top: number = verticalDistance - nodePos.y;
        let bottom: number = verticalDistance + nodePos.y;
console.log(right,left,bottom,top,"r l b t");

        return { left, right, top, bottom };
    }

    setAnchorPointToPos(node: cc.Node, point: cc.Vec2) {
        // Get the touch location in local coordinates of the image
        const touchLocation = node.convertToNodeSpaceAR(point);
        this.prevAnchorPoint = node.getAnchorPoint();

        // Calculate the offset to adjust the anchor point
        const offsetX = (touchLocation.x / node.width - node.anchorX);
        const offsetY = (touchLocation.y / node.height - node.anchorY);

        node.setAnchorPoint(node.anchorX + offsetX, node.anchorY + offsetY);

        this.currAnchorPoint = node.getAnchorPoint();
        this.resetNodePos(node)
        console.log(this.tempSprite.anchorX,this.tempSprite.anchorY,"xy");
        
    }

    resetNodePos(node: cc.Node) {
        /// Calculate the offset to reset the position to the center while keeping the anchor point
        const positionChange = new cc.Vec2(
            (this.currAnchorPoint.x - this.prevAnchorPoint.x) * (this.tempSprite.width * node.scale),
            (this.currAnchorPoint.y - this.prevAnchorPoint.y) * (this.tempSprite.height * node.scale));

        const newPos = new cc.Vec2(this.tempSprite.getPosition().x + positionChange.x, this.tempSprite.getPosition().y + positionChange.y);
        this.tempSprite.setPosition(newPos);
        this.anchorNode.setPosition(newPos); //check were anchor point is
    }

    resetAnchor(node: cc.Node) {
        this.prevAnchorPoint = node.getAnchorPoint();

        // Set the anchor point of the image to the touch location
        node.anchorX = 0.5 / node.width;
        node.anchorY = 0.5 / node.height;

        this.currAnchorPoint = node.getAnchorPoint();
        this.resetNodePos(node)
    }

    restrictPic() {
        console.log(this.tempSprite.anchorX,this.tempSprite.anchorY,"anchor are");
        

        let picWidth = this.tempSprite.getBoundingBox().width;
        let picHeight = this.tempSprite.getBoundingBox().height;

        const canvas = cc.find('Canvas'); // Get a reference to the Canvas node

        var canvasSize = canvas.getComponent(cc.Canvas).designResolution; // Get the canvas size
        // var canvasSize;
        // canvasSize.width = canvasSize.width/2;
        // canvasSize.height = canvasSize.height/2;
        console.log(picWidth,picHeight,canvasSize.width,canvasSize.height,"pic,canvas");
        
        // canvasSize.height = 1007
        // let canvasSize = this.picHeight.designResolution

        // Calculate the positions of the canvas edges
        // const rightEdge = picWidth / 2 - canvasSize.width / 2;
        // const leftEdge = canvasSize.width / 2 - picWidth / 2;
        // const bottomEdge = canvasSize.height / 2 - picHeight / 2;
        // const topEdge = picHeight / 2 - canvasSize.height / 2; //-960
        const rightEdge = picWidth / 2 - canvasSize.width / 2;
        const leftEdge = canvasSize.width / 2 - picWidth / 2;
        const  bottomEdge = canvasSize.height / 2 - picHeight / 2;
        const topEdge  = picHeight / 2 - canvasSize.height / 2; //-960
        console.log(rightEdge,leftEdge,bottomEdge,topEdge,"r,l,b,t");
        console.log(this.tempSprite.getAnchorPoint(),"kkkkkkkkk");
        
console.log(this.tempSprite.y,"canva tooo");

        if (this.tempSprite.x < leftEdge) {
            this.tempSprite.x = leftEdge;
        }

        if (this.tempSprite.x > rightEdge) {
            this.tempSprite.x = rightEdge;
        }

        if (this.tempSprite.y > topEdge) {
            console.log(this.tempSprite.y,this.tempSprite.anchorY,"here in canvas top");

            this.tempSprite.y = topEdge;
        }

        if (this.tempSprite.y < bottomEdge) {
            console.log(this.tempSprite.y,this.tempSprite.anchorY,"here in canvas bottom");
            
            this.tempSprite.y = bottomEdge;
        }
        if(this.tempSprite.scale <= 1){
            this.tempSprite.x = 0;
            this.tempSprite.y = 0;
        }
        // this.theNewAnchor()
        
        // this.resetNodePos(this.tempSprite)
        // this.resetAnchor(this.tempSprite)
        // this.setAnchorPointToPos(this.tempSprite,cc.v2(this.tempSprite.x,this.tempSprite.y))

//         let picAnchorX = this.tempSprite.anchorX;
//         let picAnchorY = this.tempSprite.anchorY;

//         // const canvas = cc.find('Canvas'); // Get a reference to the Canvas node

//         var canvasAnchor = cc.v2(0.5,0.5); // Get the canvas size
//         // var canvasSize;
//         // canvasSize.width = canvasSize.width/2;
//         // canvasSize.height = canvasSize.height/2;
//         console.log(picAnchorX,picAnchorY,"pic,canvssssssas 2");
        
//         // canvasSize.height = 1007
//         // let canvasSize = this.picHeight.designResolution

//         // Calculate the positions of the canvas edges
//         const leftEdgeA = picAnchorX / 2 - canvasAnchor.x ;
//         // const rightEdgeA  = canvasAnchor.x - picAnchorX / 2;
//         const rightEdgeA  = canvasAnchor.x - picAnchorX / 2;
//         const topEdgeA = canvasAnchor.y  - picAnchorY / 2;
//         const bottomEdgeA  = picAnchorY  - canvasAnchor.y ; //-960
// console.log(rightEdgeA,leftEdgeA,bottomEdgeA,topEdgeA,"r,l,b,t");

//         if (this.tempSprite.anchorX < leftEdgeA) {
//             this.tempSprite.anchorX = leftEdgeA;
//         }

//         if (this.tempSprite.anchorX > rightEdgeA) {
//             this.tempSprite.anchorX = rightEdgeA;
//         }

//         if (this.tempSprite.anchorY > topEdgeA) {
//             this.tempSprite.anchorY = topEdgeA;
//         }

//         if (this.tempSprite.anchorY < bottomEdgeA) {
//             this.tempSprite.anchorY = bottomEdgeA;
//         }
    }
    theNewAnchor(){
//         // Assuming you have a node named 'targetNode' that you want to reset the anchor point for
// // var targetNode = this.tempSprite

// // Get the current position of the node
// var currentPosition = this.tempSprite.position;

// // Get the current anchor point of the node
// var currentAnchor = this.tempSprite.anchorX;

// // Calculate the new anchor point based on the current position
// var newAnchor = currentPosition.x / this.tempSprite.parent.width;

// // Set the new anchor point for the node
// this.tempSprite.anchorX = newAnchor;

// // Adjust the position to keep the node in the same visual position
// this.tempSprite.x += (currentAnchor - newAnchor) * this.tempSprite.width;
var node = this.tempSprite
    // Get the current position of the node
    const currentPosition = node.position;

    // Get the current anchor point of the node
    const currentAnchor = new cc.Vec2(node.anchorX, node.anchorY);

    // Calculate the new anchor point based on the current position
    const newAnchor = new cc.Vec2(
        currentPosition.x / (node.width * node.scaleX),
        currentPosition.y / (node.height * node.scaleY)
    );

    // Set the new anchor point for the node
    node.anchorX = newAnchor.x;
    node.anchorY = newAnchor.y;
console.log(newAnchor,currentAnchor,"aaaaaaaaaaaaaaa");



    }
}
