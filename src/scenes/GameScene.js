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
    }

    create() {
        console.log('Game scene', this)
        this.input.setDefaultCursor('url(assets/input/crosshair1.png)11 11, pointer');

        this.player = new Player({
            scene: this,
            key: 'player',
            x: 400,
            y: 300,
        });

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

        this.physics.add.overlap(this.zombie, this.bullets, this.zombie.hit, null, this.zombie)
    }

    update(delta) {
        this.mouseAction = {
            x: this.input.mousePointer.x,
            y: this.input.mousePointer.y,
            click: this.input.mousePointer.isDown,
        }
                
        this.player.update(this.keys, this.mouseAction, delta);
        Array.from(this.bullets.children.entries).forEach( bullet => {
            bullet.update(delta);
        });
    }
}
export default GameScene;