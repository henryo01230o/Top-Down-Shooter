import loadImages from '../loadImages';

class Scene1 extends Phaser.Scene {
    constructor() {
        super({
            key: 'Scene1'
        });
    }
    preload() {
        this.load.image('tds_tilesheet', 'assets/tilemaps/tds_tilesheet.png');
        this.load.tilemapTiledJSON('map', 'assets/tilemaps/tds_tilemap.json');

        this.load.atlas('bullets_Blue','assets/bullets_Blue.png', 'assets/bullets_Blue.json');

        this.load.atlas('tds_characters', 'assets/characters/tds_characters.png', 'assets/characters/tds_characters.json');

        this.load.on('complete', () => {
            loadImages(this);
            this.scene.start('GameScene');
        });
    }
}
export default Scene1;