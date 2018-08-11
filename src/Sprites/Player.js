export default class Player extends Phaser.GameObjects.Sprite {
    constructor (param) {
        console.log(' player construct', param);
        if (param.scene && param.key){
            super(param.scene, param.x, param.y, param.key);
            console.log('create as self');
            // this is self created player
            param.scene.physics.world.enable(this);
            param.scene.add.existing(this);
            this.anims.play(`${param.color}_gun1`);
            this.pid = param.pid;
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
     //   this.body.setCollideWorldBounds(true);
        this.velocity = 500;
        this.angleToMouse;
        this.depth = 100;
        this.fireRate = 0;
        this.nextFire = 0;
        console.log('Class Player', this)
    }

    spawn(playerInfo){
        console.log("spawn player");
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(playerInfo.x, playerInfo.y);
        this.pid = playerInfo.pid;
        this.anims.play(`${playerInfo.color}_gun1`);
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

        this.angleToMouse = -Math.PI / 2 + Math.atan((mouseAction.x -this.x ) / (mouseAction.y - this.y)) + Math.atan(10 / distMouse);

        if (mouseAction.y < this.y) {
            this.angleToMouse -= Math.PI;
        }

        this.rotation = -this.angleToMouse;


        if (mouseAction.click && this.nextFire + this.fireRate < delta) {
            var bullet = this.scene.bullets.get(this);
            bullet.fire(
                this.x + 10 * Math.cos(this.rotation+Math.PI / 2),
                this.y + 10 * Math.sin(this.rotation+Math.PI / 2),
                this.rotation + 0.1 * Math.random() - 0.05,
            );
            this.nextFire = delta;
        }
    }
}