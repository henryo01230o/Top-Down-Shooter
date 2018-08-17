import Bullets from '../Sprites/Bullets';

const EnemyStates = {
    Dormant : 0,
    Wandering: 1,
    Alerted : 2,
    Crazy: 3
}
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
        this.score = 10;
        this.state = EnemyStates.Dormant;
        // console.log('bullets',this.scene.bullets);
        // Array.from(this.scene.bullets.children.entries).forEach( bullet => {
        //     console.log('check bullet', bullet)
        //     this.scene.physics.world.overlap(this, bullet, this.hit(bullet))
        // });
        // this.scene.bullets.world.add.overlap(this)
        // console.log('Class Enemy', this)
    }

    spawn(id, x, y, rotation){
        this.health = 100;
        this.alive = true;
        this.wake = false;
        this.setActive(true);
        this.setVisible(true);
        if (id !== undefined && id !== null){
            this.id = id;
            this.setPosition(x, y);
            this.rotation = rotation;
        }
        else {
            this.id = this.scene.zombieSeq++;
            const spawnPoints = this.scene.mapData.enemySpawnPoints;
            const spawnAt = Math.floor(Math.random() * spawnPoints.length);
            // console.log('spawn', spawnAt, spawnPoints)
            this.rotation = Math.random() * Math.PI * 2;
            this.setPosition(spawnPoints[spawnAt].x, spawnPoints[spawnAt].y);
        }
    }

    update(delta) {
        if (this.scene.peerType === 'host'){

            if (this.health < 50)
                this.state = EnemyStates.Crazy;

            let targets = this.scene.otherPlayers.children.entries.map( op => {return {pid: op.pid, x: op.x, y: op.y, health: op.health}});
            targets.push({pid: this.scene.player.pid, x: this.scene.player.x, y: this.scene.player.y, health: this.scene.player.health});
            this.followTarget(targets);


            if (this.state < EnemyStates.Alerted){
                // random walk or stay to restore health...
                this.state = (this.health < 100) ? EnemyStates.Dormant : EnemyStates.Wandering;
                if (this.state === EnemyStates.Wandering){
                    const changeDirection = Math.floor(Math.random() * 100) < 1; // 1% change direction
                    if (changeDirection)
                        this.rotation = Math.random() * Math.PI * 2;
                    this.body.velocity.x = this.velocity * Math.cos(this.rotation);
                    this.body.velocity.y = this.velocity * Math.sin(this.rotation);
                }
                else {
                    this.body.velocity.x = this.body.velocity.y = 0;
                    // TODO restore health
                    this.health += 0.5;
                }
            }
            if (!(this.body.velocity.x === 0 || this.body.velocity.y === 0)) {
                this.anims.play('zombie_walk')
            }
            else  {
                this.state = EnemyStates.Dormant;
                this.anims.play('zombie_stand')
            }
        }
    }

    followTarget(targets) {
        const sortedTargets = targets.filter( target => {
            target.dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
            return  target.dist < this.wakeDistance;
        }).sort( (p1, p2) => {
            return p1.health - p2.health || p1.dist - p2.dist;
        });

        //TODO need to bring down alert level for those out of range

        if (sortedTargets.length > 0) {
            this.state = (this.state === EnemyStates.Crazy)?this.state: EnemyStates.Alerted;
            // increase speed if alert state raised
            const velocity = this.velocity * this.state; 
            const target = sortedTargets[0];
            this.rotation = Phaser.Math.Angle.Between(target.x, target.y, this.x, this.y) + Math.PI
            this.body.velocity.x = velocity * Math.cos(this.rotation)
            this.body.velocity.y = velocity * Math.sin(this.rotation);
        }
        else {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }
    }

    hit(obj1, obj2) {
        if (this.scene.peerType === 'guest')
            return;
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        console.log('hit', this.health, bullet.dmg,  obj2.constructor.name === 'Bullets')
        this.health -= bullet.dmg;
        // bullet.rotation - Math.PI 
        // this.x -= bullet.knockback;
        if (this.health <= 0) {
            if (bullet.pid === this.scene.player.pid){
                // killed by host
                this.scene.player.score += this.score;
            }
            else {
                const killer = this.scene.otherPlayers.children.entries.find( p => p.pid === bullet.pid);
                if (killer !== undefined){
                    killer.score += this.score;
                }
            }
            this.destroy();
        }
        // console.log('this', this)
        bullet.destroy();
    };
}