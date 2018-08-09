import Player from '../sprites/Player';
import Bullets from '../sprites/Bullets';
import Enemy from '../Sprites/Enemy';

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.player;
        this.keys;
        this.mouseAction;
        this.bullets;
        this.map;
    }

    create() {
        console.log('Game scene', this)
        this.input.setDefaultCursor('url(assets/input/crosshair1.png)11 11, pointer');

        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        var tileset = this.map.addTilesetImage('tds_tilesheet');
        console.log('map', this.map, tileset);
        var layers = [];
        for (let i = 0; i< 13; i++){
            var layer = this.map.createDynamicLayer(i, tileset, 0,0);
            layers[i] = layer;
            console.log(layer);
            if (layer.layer.name === 'roof'){
                layer.alpha = 0;
            }
            else if(layer.layer.name !== 'grass') {
                this.map.setCollisionBetween(0, 10000, true, layers[i]);
            }
        }

        this.map.setCollisionByExclusion(1296, true, this.map)
        this.map.setCollisionBetween(0, 10000, true);

        this.player = new Player({
            scene: this,
            key: 'player',
            x: 400,
            y: 300,
        });
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
    
        this.keys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'space' : Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.bullets = this.physics.add.group({
            classType: Bullets,
            maxSize: 100,
            runChildUpdate: false,
        });

        this.zombie = new Enemy({
            scene: this,
            key: 'zombie',
            x: 100,
            y: 100
        })

        this.physics.add.collider(this.player, layer);

        this.physics.add.overlap(this.zombie, this.bullets, this.zombie.hit, null, this.zombie)
    }

    update(delta) {
        this.mouseAction = {
            x: this.input.mousePointer.x + this.cameras.main.scrollX,
            y: this.input.mousePointer.y + this.cameras.main.scrollY,   
            click: this.input.mousePointer.isDown,
        }
                
        this.player.update(this.keys, this.mouseAction, delta);
        Array.from(this.bullets.children.entries).forEach( bullet => {
            bullet.update(delta);
        });
    }
}
export default GameScene;