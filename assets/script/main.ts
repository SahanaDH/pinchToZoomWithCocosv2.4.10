import ZoomController from "./zoomControler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property(cc.Node)
    public tempSprite: cc.Node = undefined;

    @property(cc.Node)
    public anchorNode: cc.Node = undefined;

    zoomController: ZoomController;

    onLoad() {
        this.zoomController = new ZoomController();
        this.zoomController.initialize(this.tempSprite, this.anchorNode);
    }
}
