import loadImages from '../loadImages';

class Scene1 extends Phaser.Scene {
    constructor() {
        super({
            key: 'Scene1'
        });
    }
    preload() {
        this.load.atlas('bullets_Blue','assets/bullets_Blue.png', 'assets/bullets_Blue.json');

        this.load.atlas('tds_characters', 'assets/tds_characters.png', 'assets/tds_characters.json');

        this.load.on('complete', () => {
            loadImages(this);
            this.scene.start('GameScene');
        });
    }
}
export default Scene1;