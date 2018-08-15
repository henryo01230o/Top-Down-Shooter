export default class Bullets extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene);
        this.scene.physics.world.enable(this);
        this.setActive(false);
        this.setVisible(false);
        this.velocity = 1000;
        this.range = 500;
        this.start;
        this.dmg = 1;
        this.knockBack = 1;
    }

    fire (x, y, angle, pid) {
        this.start = {
            x: x,
            y: y,
        }
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        this.pid = pid;
        this.rotation = angle + Math.PI / 2;
        this.body.velocity.x = this.velocity * Math.cos(angle);
        this.body.velocity.y = this.velocity * Math.sin(angle);
        this.anims.play('bullets_Blue').setDisplaySize(6,27);
    }
    
    update (delta) {
        if(!this.active){
            return;
        }

        if (Math.sqrt(Math.pow(this.x - this.start.x, 2) + Math.pow(this.y - this.start.y, 2)) > this.range){
            this.destroy();
        }
    }

    hideBullet () {
        this.setVisible(false);
    }
}