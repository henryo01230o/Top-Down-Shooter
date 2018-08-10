import Bullets from '../Sprites/Bullets';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(config) {
        super(config.scene, config.x, config.y, config.key);    
        config.scene.physics.world.enable(this);
        config.scene.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.health = 100;
        this.alive = true;
        this.bullets = this.scene.bullets;
        this.hit.bind(this);
        this.anims.play('zombie_stand');
        this.velocity = 250;
        this.wake = false;
        this.wakeDistance = 300;

        console.log('bullets',this.scene.bullets);
        // Array.from(this.scene.bullets.children.entries).forEach( bullet => {
        //     console.log('check bullet', bullet)
        //     this.scene.physics.world.overlap(this, bullet, this.hit(bullet))
        // });
        // this.scene.bullets.world.add.overlap(this)
        console.log('Class Enemy', this)
    }

    update(delta) {
        this.followTarget({x: this.scene.player.x, y: this.scene.player.y})
        if (!(this.body.velocity.x === 0 || this.body.velocity.y === 0)) {
            this.anims.play('zombie_walk')
        }
        else  {
            this.anims.play('zombie_stand')
        }
    }

    followTarget(target) {
        // console.log('dist',Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y))
        if (Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) < this.wakeDistance) {
            this.rotation = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y) + Math.PI
            this.body.velocity.x = this.velocity * Math.cos(this.rotation)
            this.body.velocity.y = this.velocity * Math.sin(this.rotation);
        }
        else {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
    }

    hit(obj1, obj2) {
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        console.log('hit', this.health, bullet.dmg,  obj2.constructor.name === 'Bullets')
        this.health -= bullet.dmg;
        // bullet.rotation - Math.PI 
        // this.x -= bullet.knockback;
        if (this.health <= 0) {
            this.destroy()
        }
        console.log('this', this)
        bullet.destroy();
    };
}