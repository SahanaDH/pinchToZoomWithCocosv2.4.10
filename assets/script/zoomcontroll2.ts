
const {ccclass, property} = cc._decorator;

@ccclass
export default class zoomController extends cc.Component {

    //target node
    @property(cc.Node)
    picNode: cc.Node= null;

    //position of touch
    startPos1: any;
    startPos2: any;

    //to check zoom is In/out
    pointsDis: any;

    //to detect two touches
    touchFlag = false;
    //magnifier glass on/off
    magnifierFlag = true;
    //ceter of touches
    centerX ;
    centerY;

    currAnchorPoint: cc.Vec2;
    prevAnchorPoint: cc.Vec2;

    minZoom: number = 1;
    maxZoom: number = 5;

    initSpritePos: cc.Vec2;

    @property(cc.Node)
    anchorNode:cc.Node = null;

    onLoad() {
        this.node.on('touchstart', this.onTouchStart, this);

        this.node.on('touchmove', this.onTouchMove, this);
    }

    onTouchStart(event) {

        let touches = event.getTouches();

        if (touches.length == 1) {
            // One finger is moving, no need to write any code here
        }
        else if (touches.length > 1) {
            console.log("two touch");

            // touchFlag = true;
            this.startPos1 = this.node.convertToNodeSpaceAR(touches[0].getLocation());
            this.startPos2 = this.node.convertToNodeSpaceAR(touches[1].getLocation());

            this.pointsDis = this.startPos1.sub(this.startPos2).mag();
            console.log(this.pointsDis, " this.pointsDis");
            // let differenceDelta = startPos1 - startPos2
        }
    }

    onTouchMove(event) {
        let isAnchor = true;
        let totalTouch = 0;

        let touches = event.getTouches();
        const touch1 = touches[0];
        const touch2 = touches[1];
        if (touches.length == 1 && this.touchFlag == true) {
            // touchFlag = false;

            // One finger is moving, and touchflag true after two touches, so move the image acc. to finger movement
            let delta = event.getDelta();
            this.picNode.setPosition(this.picNode.position.add(delta));
            this.restrictPic();
        }

        else if (touches.length == 2) {

            // Two fingers are zooming
            let touchPoint1 = this.node.convertToNodeSpaceAR(touches[0].getLocation());
            let touchPoint2 = this.node.convertToNodeSpaceAR(touches[1].getLocation());
            // let newPointsDis = touchPoint1.sub(touchPoint2).mag();
            if (isAnchor) {//anchor is set at start of the pinch by getting the midpoint from 2 finger
                let midPoint = touch1.getLocation().add(touch2.getLocation()).div(2);
                this.setAnchorPointToPos(this.picNode, midPoint);
                isAnchor = false;
            }
            var a = touchPoint1.x - touchPoint2.x;
            var b = touchPoint1.y - touchPoint2.y;

            //distance betn 2 points
            var newPointsDis = Math.sqrt(a * a + b * b);

            // This line of code is for Android phones
            if (!this.pointsDis)
                this.pointsDis = 0;

            if (newPointsDis > this.pointsDis) {

                // Indicates that two fingers are swiping outward
                this.pointsDis = newPointsDis;
                if (this.picNode.scale <= 5)
                    this.picNode.scale += 0.05;
            }

            else if (newPointsDis < this.pointsDis) {

                // Indicates that two fingers are swiping inwards

                //when scale is 1 
                if (this.picNode.scale <= 1) {
                    this.picNode.scale = 1;
                    //disable moving the target
                    this.touchFlag = false;
                    return;
                }

                this.pointsDis = newPointsDis;

                if (this.picNode.scale >= 1) {

                    this.picNode.scale -= 0.05;
                    this.touchFlag = false;
        
                }
            }
         

            // this.restrictPic();
            
            this.node.on('touchend', function (event) {
                if (this.picNode.scale != 1)
                //enable moving the target
                    this.touchFlag = true;

                    totalTouch -= 1;
                    if (totalTouch === 0) {
                        isAnchor = true;
                        this.resetAnchor(this.picNode);
                    }
        
                    if (this.picNode.scale === this.minZoom) {
                        this.picNode.setAnchorPoint(0.5, 0.5);
                        this.picNode.setPosition(this.initSpritePos);
                        this.resetAnchor(this.picNode);
                    }
                    this.touchFlag = true;
            }, this)
 
        }
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
    }

    resetNodePos(node: cc.Node) {
        /// Calculate the offset to reset the position to the center while keeping the anchor point
        const positionChange = new cc.Vec2(
            (this.currAnchorPoint.x - this.prevAnchorPoint.x) * (this.picNode.width * node.scale),
            (this.currAnchorPoint.y - this.prevAnchorPoint.y) * (this.picNode.height * node.scale));

        const newPos = new cc.Vec2(this.picNode.getPosition().x + positionChange.x, this.picNode.getPosition().y + positionChange.y);
        this.picNode.setPosition(newPos);
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

        //Restrict movement, black edges will appear when placed
        let picWidth = this.picNode.getBoundingBox().width;
        let picHeight = this.picNode.getBoundingBox().height;

        const canvas = cc.find('Canvas'); // Get a reference to the Canvas node

        var canvasSize = canvas.getComponent(cc.Canvas).designResolution; // Get the canvas size
        // canvasSize.height = 1007;
        // let canvasSize = this.picHeight.designResolution

        // Calculate the positions of the canvas edges
        const rightEdge = picWidth / 2 - canvasSize.width / 2;
        const leftEdge = canvasSize.width / 2 - picWidth / 2;
        const  bottomEdge = canvasSize.height / 2 - picHeight / 2;
        const topEdge  = picHeight / 2 - canvasSize.height / 2; //-960

        if (this.picNode.x < leftEdge) {
            this.picNode.x = leftEdge;
        }

        if (this.picNode.x > rightEdge) {
            this.picNode.x = rightEdge;
        }

        if (this.picNode.y > topEdge) {
            this.picNode.y = topEdge;
        }

        if (this.picNode.y < bottomEdge) {
            this.picNode.y = bottomEdge;
        }
        
        if(this.picNode.scale <= 1){
            this.picNode.x = 0;
            this.picNode.y = 0;
        }
    }

    // update (dt) {},


}
