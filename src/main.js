import 'phaser';
import Scene1 from './scenes/Scene1';
import GameScene from './scenes/GameScene';

var config = {
    type : Phaser.AUTO,
    width : 800,
    height : 600,
    physics : {
        default : 'arcade',
        arcade : {
            gravity : {y : 0}
        }
    },
    scene : [
        Scene1,
        GameScene,
    ],
    url: 'test',
};

var game = new Phaser.Game(config)
// to pass values to global variable, use this.sys.game.key
// game.myThing = "test2";