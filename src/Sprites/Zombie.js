export default class Zombie extends Phaser.GameObjects.Sprite {
    constructor (config) {
        super(config.scene, config.x, config.y, config.key);
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.anims.play('zombie_stand')
        this.alive = true;
        this.health = 10;
        console.log('Class Zombie', this);
    }

    update(delta) {
        if (this.health <= 0) {
            this.killed();
        }
    }

    hit(zombie) {
        var bullet = this.scene.bullets.get(this);
        this.sprite.alpha = 0; // player.sprite.alpha = 0;
    }

    killed() {
        this.setActive(true);
        this.setVisible(true);
    }
}