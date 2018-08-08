import Bullets from '../Sprites/Bullets';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);    
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.health = 100;
        this.alive = true;
        this.bullets = this.scene.bullets;
        this.hit.bind(this);
        this.anims.play('zombie_stand');

        console.log('bullets',this.scene.bullets);
        // Array.from(this.scene.bullets.children.entries).forEach( bullet => {
        //     console.log('check bullet', bullet)
        //     this.scene.physics.world.overlap(this, bullet, this.hit(bullet))
        // });
        // this.scene.bullets.world.add.overlap(this)
        console.log('Class Enemy', this)
    }

    update(delta) {
    }

    hit(obj1, obj2) {
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        console.log('hit', this.health, bullet.dmg,  obj2.constructor.name === 'Bullets')
        this.health -= bullet.dmg;
        // bullet.rotation - Math.PI 
        // this.x -= bullet.knockback;
        if (this.health <= 0) {
            this.killed()
        }
        console.log('this', this)
    };

    killed() {
        this.alive = false;
        this.setActive(false);
        this.setVisible(false);
    }
}