export default class Bullets extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene);
        this.scene.physics.world.enable(this);
        this.setActive(false);
        this.setVisible(false);
        this.velocity = 1000;
        this.dmg = 1;
        this.knockBack = 1;
        // console.log('Bullets', this);
    }

    fire (x, y, angle) {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);
        this.rotation = angle + Math.PI / 2;
        this.body.velocity.x = this.velocity * Math.cos(angle);
        this.body.velocity.y = this.velocity * Math.sin(angle);
        this.anims.play('bullets_Blue').setDisplaySize(6,27);
    }
    
    update (delta) {
        if(!this.active){
            return;
        }
        if (this.x < this.scene.physics.world.bounds.left 
            || this.x > this.scene.physics.world.bounds.right 
            || this.y < this.scene.physics.world.bounds.top 
            || this.y > this.scene.physics.world.bounds.height ) {
            this.destroy();
        }
    }

    destroy () {
        this.setActive(false);
        this.setVisible(false);
    }
}