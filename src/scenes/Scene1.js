import loadImages from '../loadImages';

class Scene1 extends Phaser.Scene {
    constructor() {
        super({
            key: 'Scene1'
        });
    }
    preload() {
        const url = new URL(window.location.href);
        const remoteJoinKey = url.searchParams.get("joinGame");

        // the following is the list of tile maps for different levels to be loaded.
        // host player can choose different map to play the game.
        this.load.json('mapData', 'assets/tilemaps/map_data.json');

        // this.load.image('tds_tilesheet', 'assets/tilemaps/tds_tilesheet.png');
        // this.load.tilemapTiledJSON('map', 'assets/tilemaps/tds_tilemap.json');

        this.load.atlas('bullets_Blue','assets/bullets_Blue.png', 'assets/bullets_Blue.json');

        this.load.atlas('tds_characters', 'assets/characters/tds_characters.png', 'assets/characters/tds_characters.json');

        this.load.on('complete', () => {
            loadImages(this);
            // somehow this menu scene choose the map and other data to pass to game scene
            if (remoteJoinKey !== null){
                this.scene.start('GameScene', {remoteJoinKey: remoteJoinKey, difficulty: '1'});
            }
            else 
                this.scene.start('GameScene', {mapKey: 'map1', difficulty: '1'});
        });
    }
}
export default Scene1;