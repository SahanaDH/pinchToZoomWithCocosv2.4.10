// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

var newAnchor = cc.v2(0, 0)
var oldAnchor = cc.v2(0.5, 0.5)
var calculatedOnce = false;
@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    @property(cc.Node)
    public tempSprite: cc.Node = undefined;

    @property(cc.Camera)
    public camera: cc.Camera = undefined;

    currAnchorPoint: cc.Vec2;
    prevAnchorPoint: cc.Vec2;

    maxZoom: number = 5;

    onLoad() {
        let isAnchor = true;
        let totalTouch = 0;
        this.tempSprite.on("touchstart", (event) => {
            totalTouch += 1;
            var point = event.getTouches()[0].getLocation();
            const touchLocation = this.tempSprite.convertToNodeSpaceAR(point);
            const touchLocation2 = this.tempSprite.parent.convertToNodeSpaceAR(point);
            console.log('image node space', touchLocation.x, touchLocation.y);
            console.log('image parent node space', touchLocation2.x, touchLocation2.y);
        });

        this.tempSprite.on("touchmove", (event) => {
            var touches = event.getTouches();
            if (touches.length >= 2) {
                var touch1 = touches[0],
                    touch2 = touches[1];
                var delta1 = touch1.getDelta();
                var delta2 = touch2.getDelta();
                var touchPoint1: cc.Vec2 = this.node.convertToNodeSpaceAR(touch1.getLocation());
                var touchPoint2: cc.Vec2 = this.node.convertToNodeSpaceAR(touch2.getLocation());

                if (isAnchor) {
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


                this.tempSprite.scale = Math.min(Math.max(1, scale), this.maxZoom);
            }
        });

        this.tempSprite.on("touchend", (event) => {
            totalTouch -= 1;
            if (totalTouch === 0 && this.tempSprite.scale === 1) {
                isAnchor = true;
            }

            if (this.tempSprite.scale === 1) {
                this.resetAnchor(this.tempSprite);
            }
        });
    }

    setAnchorPointToPos(node: cc.Node, point: cc.Vec2) {
        // Get the touch location in local coordinates of the image
        const touchLocation = node.convertToNodeSpaceAR(point);
        this.prevAnchorPoint = node.getAnchorPoint();
        // Calculate the offset to adjust the anchor point based on scaling
        const scale = node.scale;

        const offsetX = (touchLocation.x / node.width - node.anchorX) / scale;
        const offsetY = (touchLocation.y / node.height - node.anchorY) / scale;

        node.setAnchorPoint(node.anchorX + offsetX, node.anchorY + offsetY);

        this.currAnchorPoint = node.getAnchorPoint();
        this.resetNodePos(node)
    }

    resetNodePos(node: cc.Node) {
        /// Calculate the offset to reset the position to the center while keeping the anchor point
        const positionChange = new cc.Vec2(
            (this.currAnchorPoint.x - this.prevAnchorPoint.x) * (this.tempSprite.width),
            (this.currAnchorPoint.y - this.prevAnchorPoint.y) * (this.tempSprite.height));

        const newPos = new cc.Vec2(this.tempSprite.getPosition().x + positionChange.x, this.tempSprite.getPosition().y + positionChange.y);
        this.tempSprite.setPosition(newPos);
    }

    resetAnchor(node: cc.Node) {
        this.prevAnchorPoint = node.getAnchorPoint();

        // Set the anchor point of the image to the touch location
        node.anchorX = 0.5 / node.width;
        node.anchorY = 0.5 / node.height;

        this.currAnchorPoint = node.getAnchorPoint();
        this.resetNodePos(node)
    }


    // onLoad() {
    //     let imageScale = 1;
    //     let start: any = {};
    //     let isStart: boolean = true;
    //     // this.schedule(() => {
    //     //     this.camera.zoomRatio = 5;
    //     // }, 2)

    //     // this.tempSprite.on("touchstart", function (event: cc.Event.EventTouch) {
    //     //     // if (event.getTouches().length === 2) {
    //     //     //     event.stopPropagation();

    //     //     //     let [touchPoint1, touchPoint2] = this.convertToNodeSpace(event.getTouches()[0], event.getTouches()[1]);

    //     //     //     // Calculate where the fingers have started on the X and Y axis
    //     //     //     start.x = (touchPoint1.x + touchPoint2.x) / 2;
    //     //     //     start.y = (touchPoint1.y + touchPoint2.y) / 2;
    //     //     //     start.distance = this.distance(touchPoint1, touchPoint2);
    //     //     // }
    //     // }, this);

    //     this.tempSprite.on("touchmove", function (event: cc.Event.EventTouch) {
    //         if (event.getTouches().length === 2) {
    //             event.stopPropagation();
    //             const touches = event.getTouches();
    //             const touch1 = touches[0];
    //             const touch2 = touches[1];
    //             const delta1 = touch1.getDelta();
    //             const delta2 = touch2.getDelta();

    //             let [touchPoint1, touchPoint2] = this.convertToNodeSpace(event.getTouches()[0], event.getTouches()[1]);
    //             if (isStart) {
    //                 // Calculate where the fingers have started on the X and Y axis
    //                 start.x = (touchPoint1.x + touchPoint2.x) / 2;
    //                 start.y = (touchPoint1.y + touchPoint2.y) / 2;
    //                 start.distance = touch1.getLocation().mul(imageScale).sub(touch2.getLocation().mul(imageScale)).mag();
    //                 isStart = false;
    //             }

    //             // const deltaDistance = this.distance(touchPoint1, touchPoint2);
    //             const deltaDistance = touch1.getLocation().sub(touch2.getLocation()).mag();
    //             const deltadelta = delta1.sub(delta2).mag();
    //             const mulDeltaDist = touch1.getLocation().mul(imageScale).sub(touch2.getLocation().mul(imageScale)).mag();
    //             let scaleFactor = (deltaDistance + deltadelta) / mulDeltaDist;
    //             imageScale = Math.min(Math.max(1, scaleFactor), 4);

    //             // Calculate how much the fingers have moved on the X and Y axis
    //             const deltaX = (((touchPoint1.x + touchPoint2.x) / 2) - start.x) * 2; // x2 for accelarated movement
    //             const deltaY = (((touchPoint1.y + touchPoint2.y) / 2) - start.y) * 2; // x2 for accelarated movement

    //             // Transform the image to make it grow and move with fingers

    //             // this.tempSprite.setPosition(deltaX, deltaY);
    //             this.tempSprite.setScale(imageScale);
    //         }
    //     }, this);

    //     this.tempSprite.on("touchend", function (event) {
    //         isStart = true;
    //     }, this);
    // }

    distance(vec1: cc.Vec2, vec2: cc.Vec2) {
        return Math.hypot(vec1.x - vec2.x, vec1.y - vec2.y);
    }

    convertToNodeSpace(touch1, touch2) {
        return [this.node.convertToNodeSpaceAR(touch1.getLocation()), this.node.convertToNodeSpaceAR(touch2.getLocation())];
    }

    onClickOfUpdateAnchorPoint() {
        // Update the anchor point
        this.tempSprite.setAnchorPoint(newAnchor);
    }

    onClickOfPositionUpdate() {

        // Calculate the position change
        const positionChange = new cc.Vec2(
            (newAnchor.x - oldAnchor.x) * (this.tempSprite.width),
            (newAnchor.y - oldAnchor.y) * (this.tempSprite.height));

        const newPos = new cc.Vec2(this.tempSprite.getPosition().x + positionChange.x, this.tempSprite.getPosition().y + positionChange.y);
        this.tempSprite.setPosition(newPos);

    }

    // update (dt) {}
}
