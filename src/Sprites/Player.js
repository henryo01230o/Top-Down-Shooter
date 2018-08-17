import msgpack from 'msgpack-lite';

// can move the following setting to config setting json
const GunType = {
    gun1: {
        // hand gun
        fireRate: 500,
        dmg: 20,
        magazine: 6,
        reload: 1000,
    },
    gun2: {
        fireRate: 50,
        dmg: 2,
        magazine: 30,
        reload: 1000,
    },
    gun3: {
        fireRate: 1000,
        dmg: 100,
        magazine: 2,
        reload: 3000,
    },
};

export default class Player extends Phaser.GameObjects.Sprite {
    constructor (param) {
        console.log(' player construct', param);
        if (param.scene && param.key){
            super(param.scene, param.x, param.y, param.key);
            console.log('create as self');
            // this is self created player
            param.scene.physics.world.enable(this);
            param.scene.add.existing(this);
            this.gunType = 'gun1';  // can be parameterized or set null for unarmed player
            if (this.gunType)
                this.anims.play(`${param.color}_${this.gunType}`);
            else 
                this.anims.play(`${param.color}_stand`);
            this.pid = param.pid;
            this.color= param.color;
        }
        else {
            console.log('create as group');
            super(param);
            // this is other players which passes a the scene argument
            param.physics.world.enable(this);
            param.add.existing(this);
            this.setActive(false);
            this.setVisible(false);
        }
        this.body.setCollideWorldBounds(true);
        this.velocity = 300;
        this.angleToMouse;
        this.depth = 100;
        if (this.gunType) 
            this.fireRate = GunType[this.gunType].fireRate;
        this.nextFire = 0;
        this.score = 0;
        this.health = 100;
        console.log('Class Player', this)
    }

    spawn(playerInfo){
        console.log("spawn player");
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(playerInfo.x, playerInfo.y);
        this.pid = playerInfo.pid;
        this.color = playerInfo.color;
        this.gunType = 'gun1';  // can be parameterized or set null for unarmed player
        if (this.gunType){
            this.anims.play(`${playerInfo.color}_${this.gunType}`);
            this.fireRate = GunType[this.gunType].fireRate;
        }
        else 
            this.anims.play(`${playerInfo.color}_stand`);
        console.log('new other player added at', this.x, this.y);
    }
    update(keys, mouseAction, delta) {
        if (keys.left.isDown) {
            this.body.velocity.x = -this.velocity;
        }
        else if (keys.right.isDown) {
            this.body.velocity.x = this.velocity;
        }
        else {
            this.body.velocity.x = 0;
        };

        if (keys.up.isDown) {
            this.body.velocity.y = -this.velocity;
        }
        else if (keys.down.isDown) {
            this.body.velocity.y = this.velocity;
        }
        else {
            this.body.velocity.y = 0;
        };

        const distMouse = Math.sqrt(Math.pow(mouseAction.y - this.y, 2) + Math.pow(mouseAction.x - this.x , 2));

        this.angleToMouse = -Math.PI / 2 + Math.atan((mouseAction.x -this.x ) /
            (mouseAction.y - this.y)) + Math.atan(10 / distMouse);

        if (mouseAction.y < this.y) {
            this.angleToMouse -= Math.PI;
        }

        this.rotation = -this.angleToMouse;

        if (this.scene.hostConn){
            if (this.scene.peerType === 'guest' ) {
                this.scene.hostConn.send(msgpack.encode({action:'move', data:{x: this.x, y: this.y, rotation: this.rotation, pid: this.pid}}));
            }
        }
        else if (this.scene.myConn){
            if (this.scene.peerType === 'host' ) {
                Object.keys(this.scene.myConn.connections).forEach( k => {
                    // console.log('send move', k, this.scene.myConn.connections);
                    this.scene.myConn.connections[k][0].send(msgpack.encode({action:'move', data:{x: this.x, y: this.y, rotation: this.rotation, pid: this.pid}}));
                });
            }
        }

        if (mouseAction.click && this.nextFire + this.fireRate < delta) {
            if (this.scene.peerType === 'host'){
                var bullet = this.scene.bullets.get(this);
                bullet.fire(
                    this.x + 10 * Math.cos(this.rotation+Math.PI / 2),
                    this.y + 10 * Math.sin(this.rotation+Math.PI / 2),
                    this.rotation + 0.1 * Math.random() - 0.05,
                    this.pid,
                    GunType[this.gunType].dmg,
                    this.scene.bulletSeq++
                );
            }
            else {
                this.scene.hostConn.send(msgpack.encode({
                    action:'fire', 
                    data:{
                        x:this.x, 
                        y: this.y, 
                        rotation: this.rotation, 
                        pid: this.pid, 
                        dmg: GunType[this.gunType].dmg,
                        id: this.scene.bulletSeq++
                    }
                }));
            }
            this.nextFire = delta;
        }
    }
}