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
        this.spwanPoint = [
            {
                x: 100,
                y: 100,
            },
        ]
    }

    create() {
        console.log('Game scene', this)
        this.input.setDefaultCursor('url(assets/input/crosshair1.png)11 11, pointer');

        this.player = new Player({
            scene: this,
            key: 'player',
            x: this.spwanPoint[0].x,
            y: this.spwanPoint[0].y
        });

        
        this.bullets = this.physics.add.group({
            classType: Bullets,
            maxSize: 100,
            runChildUpdate: false,
        });

        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        var tileset = this.map.addTilesetImage('tds_tilesheet');
        console.log('map', this.map, tileset);
        this.layersMap = new Map();
        for (let i = 0; i< 13; i++){
            var layer = this.map.createDynamicLayer(i, tileset, 0,0);
            this.layersMap.set(layer.layer.name, layer);
            // if (layer.layer.name === 'roof'){
            //     layer.alpha = 0;
            // }
            if(!(layer.layer.name === 'grass' ||
            layer.layer.name === 'floor' ||
            layer.layer.name === 'roof' )) {
                this.map.setCollisionBetween(0, 10000, true, layer);
                this.physics.add.collider(this.player, layer);
                this.physics.add.collider(this.bullets, layer, this.hitLayer,null, this);
            }
            else if (layer.layer.name === 'roof'){
                this.map.setCollisionBetween(0, 10000, true, layer);
                this.physics.add.collider(this.bullets, layer, this.hitRoof,null, this);
            }
        }

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);
    
        this.keys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'space' : Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.spawnZombie.bind(this);
        this.spawnZombie();
        this.physics.add.collider(this.player, layer);

        this.roofLayer = this.layersMap.get('roof');
        
        this.physics.add.overlap(this.player, this.roofLayer, this.setRoofDisplay, null, this);

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
    }

    spawnZombie(){
        this.zombie = new Enemy({
            scene: this,
            key: 'zombie',
            x: 1280,
            y: 1456
        })

        this.physics.add.overlap(this.zombie, this.bullets, this.zombie.hit, null, this.zombie)

    }
    hitLayer(obj1, obj2){
        // console.log('higLayer', obj1, obj2);
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        const tile =  (obj1.constructor.name === 'Bullets')? obj2: obj1;
        console.log('hit with other layer, tile:', tile);
        bullet.destroy();
    }

    hitRoof(obj1, obj2){
        // console.log('higLayer', obj1, obj2);
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        const tile =  (obj1.constructor.name === 'Bullets')? obj2: obj1;
        // if (tile.layer.name === 'roof') {
            if(this.roofLayer.alpha === 1){
                bullet.destroy();
                console.log('roof display, hide bullet')
            }   
            else{
                console.log('roof not display, show bullet');
            }
            return;
        // }
        // console.log('hit with other layer, tile:', tile);
        // bullet.destroy();
    }

    setRoofDisplay(obj1, obj2){

        const player = (obj1.constructor.name === 'Player')? obj1: obj2;
        const tile = this.roofLayer.getTileAtWorldXY(player.x, player.y);
        if (tile){
            this.roofLayer.alpha = 0;
        }
        else {
            this.roofLayer.alpha = 1;
        }

        // this.zombies.forEach( z => {}
            // z
            const zombieTile = this.roofLayer.getTileAtWorldXY(this.zombie.x, this.zombie.y);
            if (zombieTile ){
               if(!tile){
                this.zombie.setVisible(false);
               }
               else {
                   this.zombie.setVisible(true);
               }
            }
            else{
                this.zombie.setVisible(true);
            }
        //)

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

        this.updateText();
    }

    updateText (){
        this.text.setText('x:' + Math.floor(this.player.x) + ' y:' + parseInt(this.player.y,10));
    }
}
export default GameScene;