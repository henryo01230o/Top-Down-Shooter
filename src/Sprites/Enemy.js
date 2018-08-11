import Bullets from '../Sprites/Bullets';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        // super(config.scene, config.x, config.y, config.key);  
        super(scene);  
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setActive(false);
        this.setVisible(false);
        this.body.setCollideWorldBounds(true);
        this.bullets = this.scene.bullets;
        this.hit.bind(this);
        this.anims.play('zombie_stand');
        this.velocity = 25;
        this.wakeDistance = 300;
        this.scene.physics.add.overlap(this, this.scene.bullets, this.hit, null, this);

        // console.log('bullets',this.scene.bullets);
        // Array.from(this.scene.bullets.children.entries).forEach( bullet => {
        //     console.log('check bullet', bullet)
        //     this.scene.physics.world.overlap(this, bullet, this.hit(bullet))
        // });
        // this.scene.bullets.world.add.overlap(this)
        console.log('Class Enemy', this)
    }

    spawn(){
        this.health = 100;
        this.alive = true;
        this.wake = false;
        const spawnPoints = this.scene.mapData.enemySpawnPoints;
        const spawnAt = Math.floor(Math.random() * spawnPoints.length);
        // console.log('spawn', spawnAt, spawnPoints)
        this.rotation = Math.random() * Math.PI * 2;
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(spawnPoints[spawnAt].x, spawnPoints[spawnAt].y);
    }

    update(delta) {
        // TODO change the player to players group
        if (this.scene.player)
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