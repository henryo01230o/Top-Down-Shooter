import Player from '../Sprites/Player';
import Bullets from '../Sprites/Bullets';
import Enemy from '../Sprites/Enemy';
import GameData from '../data/GameData';
import Peer from 'peerjs';
const msgpack = require("msgpack-lite");

class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'GameScene'
        });
        this.player;
        this.keys;
        this.mouseAction;
        this.bullets;
        this.map;
        this.spwanPoint = [
            {x: 100, y: 100,},
            {x: 1400, y: 1400,},
        ]
        if (!this.gameData) 
            this.gameData = new GameData();

        this.addPlayerPhysics.bind(this);
    }

    init(config){
        this.myConn = new Peer();
        // this.others = {};    // to replace peer.connections
        console.log(this.myConn);

        this.setupPeer.bind(this);
        this.setupPeer(config.remoteJoinKey);

        this.mapKey = config.mapKey;
        console.log('mapKey', this.mapKey);
        this.mapData = this.cache.json.get('mapData')[this.mapKey];
        this.difficulty = config.difficulty;

    }

    setupPeer(remoteJoinKey){

        if (remoteJoinKey){
            console.log('remoteJoinKey', remoteJoinKey);
            
            // do p2p connection
            this.peerType = 'guest';

            // get data from host
            this.hostConn = this.myConn.connect(remoteJoinKey, {serialization: 'none'});
            this.hostConn.on('open', () => {
                const encoded = msgpack.encode({action: 'joinGame'});
                const unencoded = msgpack.decode(encoded);
                console.log('send host', encoded, unencoded);
                this.hostConn.send(encoded);

                // receive data from host 
                this.hostConn.on('data', (data) => {
                    // console.log('receive host:', data);
                    const decoded = msgpack.decode(new Uint8Array(data));
                    // console.log('decoded host:', decoded);
                    switch (decoded.action){
                        case 'getMap':
                            this.mapKey = decoded.data;
                            console.log('get mapKey', this.mapKey);
                            break;
                        case 'joinGame':
                            console.log('joinGame', decoded.data, this.myConn.id);
                            decoded.data.forEach( player => {
                                if (player.pid === this.myConn.id && (this.player === undefined || this.player === null) ){
                                    // for self
                                    console.log('add me');
                                    this.addMyPlayer({
                                        key: 'player',
                                        pid: player.pid,
                                        x: player.x,
                                        y: player.y,
                                        color: player.color,
                                    })
                                }
                                else if ( !this.otherPlayers.children.entries.find( op => op.pid === player.pid) ) {
                                    // add other
                                    console.log('add other',player.pid, player.x, player.y, player.color);
                                    this.addOtherPlayer(player.pid, player.x, player.y, player.color);
                                }
                            });
                            break;
                        case 'addPlayer':
                            const newPlayerInfo = decoded.data;
                            if ( !this.otherPlayers.children.entries.find( op => op.pid === newPlayerInfo.pid) ) {
                                // add other
                                this.addOtherPlayer(newPlayerInfo.pid, newPlayerInfo.x, newPlayerInfo.y, newPlayerInfo.color);
                            }
                            break;
                        case 'move':
                            // update move data
                            const player = this.otherPlayers.children.entries.find(op => op.pid === decoded.data.pid);
                            // console.log('move player', player);
                            player.setPosition(decoded.data.x, decoded.data.y);
                            player.setRotation(decoded.data.rotation);
                            break;
                        case 'fire':
                            const bullet = this.bullets.get(this);
                            bullet.fire(
                                decoded.data.x + 10 * Math.cos(decoded.data.rotation+Math.PI / 2),
                                decoded.data.y + 10 * Math.sin(decoded.data.rotation+Math.PI / 2),
                                decoded.data.rotation + 0.1 * Math.random() - 0.05,
                                decoded.data.pid
                            );
            
                            break;
                        default:

                    }
                });

                // host disconnected
                this.hostConn.on('close', () => {
                    window.alert('you are disconnected with host');
                    // do something to handle the disconnection
                    // such as game over or title screen
                })

                // error
                this.hostConn.on('error', (err) => {
                    console.log('error:', err);
                })
            });
        }
        else {
            this.peerType='host';
            this.clientConns = new Map();

            this.myConn.on('open', (id) => {
                this.hostUrl = window.location.href + '?joinGame='+id+'&mapId='+this.mapKey;
                window.displayJoinGameUrl('Share this link to join your game:\n'+ this.hostUrl);
                console.log('url', this.hostUrl);
                this.addMyPlayer({
                    key: 'player',
                    pid: this.myConn.id,
                    x: 1400,
                    y: 1400,
                    color: 'black1',
                });
        
            });
            this.myConn.on('connection', (conn) => {
                console.log('client connected', conn.peer);
                // add conneciton to 
                this.clientConns.set(conn.peer, conn);

                conn.on('close', () => {
                    console.log('client closed');
                    this.clientConns.delete(conn.peer);
                    // TODO: remove player from the game

                });
                conn.on('error', (err) => {
                    console.log('error:', err);
                })

                conn.on('data', (data) => {

                    // console.log('client data', new Uint8Array(data));
                    const decoded = msgpack.decode(new Uint8Array(data));
                    // console.log('decoded client', decoded);
                    // switch actions
                    switch (decoded.action){
                        case 'joinGame':
                            // conn.send(msgpack.encode({action:'getMap', data:this.mapKey}));
                            if (!this.otherPlayers.children.entries.find(op => op.pid === conn.peer)){
                                // generate new player record
                                const newPlayerInfo = this.addOtherPlayer(conn.peer);
                                
                                //broadcast everyone new player joined
                                //console.log('connections',this.myConn.connections); // {key:[1]}
                                Object.keys(this.myConn.connections).forEach( k => 
                                    this.myConn.connections[k][0].send(msgpack.encode({action: 'addPlyaer', data: newPlayerInfo }))
                                );
                            }
                            const otherPlayersInfo = this.otherPlayers.children.entries.map( op => {
                                return { pid: op.pid, x: op.x, y:op.y, color: op.color };
                            });
                            const allPlayerInfo = [...otherPlayersInfo, {pid:this.myConn.id, x: this.player.x, y: this.player.y, color: "black1"}];
                            conn.send(msgpack.encode({action: 'joinGame', data:allPlayerInfo}));
                            break;
                        case 'move':
                            // update movement data
                            Object.keys(this.myConn.connections)
                                .forEach( k => {
                                    if (k !== conn.peer){
                                        this.myConn.connections[k][0].send(msgpack.encode({action: 'move', data: decoded.data }));
                                    }
                                });
                            // update other player
                            const otherPlayer = this.otherPlayers.children.entries.find( op => {
                                // console.log('op', op, data, op.pid === data.pid);
                                return op.pid === decoded.data.pid
                            });
                            // console.log('otherPlayer', otherPlayer, this.otherPlayers);
                            otherPlayer.setPosition(decoded.data.x, decoded.data.y);
                            otherPlayer.setRotation(decoded.data.rotation);
                            break;
                        case 'fire':
                            // fire event is only rendered in server, only bullet positions are sent to players
                            this.bullets.fire(decoded.data.x, decoded.data.y, decoded.data.rotation, decoded.data.pid);
                            Object.keys(this.myConn.connections).forEach( k => 
                                this.myConn.connections[k][0].send(msgpack.encode({action:'fire', data: decoded.data}))
                            );
                            break;

                        default:
                    }
                })

            })

        }
    }

    addOtherPlayer(connId, x, y, color){
        const playerSpawnPoints = this.mapData.playerSpawnPoints;

        const spawnAt = Math.floor(Math.random() * playerSpawnPoints.length);
        const spawnColor = Math.floor(Math.random() * 3);
        let newPlayerInfo = {
            pid: connId, 
            x: x,
            y: y,
            color: color,
        };
        if (x === undefined || x === null){
            newPlayerInfo.x = playerSpawnPoints[spawnAt].x;
            newPlayerInfo.y = playerSpawnPoints[spawnAt].y;
            newPlayerInfo.color= ['green1','blue1','yellow'][spawnColor]; 
        }

        const newPlayer = this.otherPlayers.get(this);
        newPlayer.spawn(newPlayerInfo);

        // this.addPlayerPhysics(newPlayer);

        return newPlayerInfo;
    }
    preload() {

        this.load.image('tds_tilesheet', this.mapData.image);
        this.load.tilemapTiledJSON('map', this.mapData.json);
        this.gameData.gameMap = this.mapData;
         
    }
    addMyPlayer(playerInfo){
        this.player = new Player({
            scene: this,
            key: playerInfo.key,
            pid: playerInfo.pid,
            x: playerInfo.x,
            y: playerInfo.y,
            color: playerInfo.color
        });

        this.addPlayerPhysics(this.player);
        this.cameras.main.startFollow(this.player);
    }

    addPlayerPhysics(player){
        this.layersMap.forEach((layer, name)=>{
            if (!this.mapData.nonCollidableLayers.includes(name)){
                // console.log('add collistion to ', name);
                this.physics.add.collider(player, layer);
            }
            if (this.mapData.roofLayers.includes(name)){
                // console.log('add roof display to', name)
                this.physics.add.overlap(player, layer, this.setRoofDisplay, null, this);
            }
        });

    }
    create() {
        this.addMyPlayer.bind(this);
        
        this.input.setDefaultCursor('url(assets/input/crosshair1.png)11 11, pointer');
        
        this.otherPlayers = this.physics.add.group({
            classType: Player,
            maxSize: 10,
            runChildUpdate: false,
        })
        this.bullets = this.physics.add.group({
            classType: Bullets,
            maxSize: 100,
            runChildUpdate: false,
        });

        this.map = this.make.tilemap({ key: 'map', tileWidth: this.mapData.tileWidth, tileHeight: this.mapData.tileHeight });
        var tileset = this.map.addTilesetImage('tds_tilesheet');

        this.layersMap = new Map();
        this.roofLayers = [];

        for (let i = 0; i< this.mapData.layers; i++){
            var layer = this.map.createDynamicLayer(i, tileset, 0,0);
            this.layersMap.set(layer.layer.name, layer);
            // if(!(layer.layer.name === 'grass' || layer.layer.name === 'floor' || layer.layer.name === 'roof' || layer.layer.name === 'fence')) {
            if (!this.mapData.nonCollidableLayers.includes(layer.layer.name)){
                // console.log('layer', layer.layer.name);
                this.map.setCollisionBetween(0, 10000, true, layer);
                // this.physics.add.collider(this.player, layer);
                this.physics.add.collider(this.bullets, layer, this.hitLayer,null, this);
            }
            if (this.mapData.roofLayers.includes(layer.layer.name)){
                this.map.setCollisionBetween(0, 10000, true, layer);
                this.physics.add.collider(this.bullets, layer, this.hitRoof,null, this);
                // this.physics.add.overlap(this.player, layer, this.setRoofDisplay, null, this);
                this.roofLayers.push(layer);
            }
        }

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        this.keys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'space' : Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        this.spawnZombie.bind(this);
        this.spawnZombie();        

        this.text = this.add.text(16, 16, '', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        this.text.setScrollFactor(0);
    }

    spawnZombie(){
        this.zombies = this.physics.add.group({
            classType: Enemy,
            maxSize: 100,
            runChildUpdate: false,
        });

        setInterval(() => {
            if (this.zombies.children.entries.length >  100)
                return;
            const newbie = this.zombies.get(this);
            newbie.spawn();
        }, 5000);
        // this.zombie = new Enemy({
        //     scene: this,
        //     key: 'zombie',
        //     x: 1280,
        //     y: 1456
        // })

        // this.physics.add.overlap(this.zombie, this.bullets, this.zombie.hit, null, this.zombie)

    }
    hitLayer(obj1, obj2){
        // console.log('higLayer', obj1, obj2);
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        const tile =  (obj1.constructor.name === 'Bullets')? obj2: obj1;
        // console.log('hit with other layer, tile:', tile);
        bullet.destroy();
    }

    hitRoof(obj1, obj2){
        const bullet = (obj1.constructor.name === 'Bullets')? obj1: obj2;
        const tile =  (obj1.constructor.name === 'Bullets')? obj2: obj1;
        this.roofLayers.filter( roofLayer => roofLayer.layer.name === tile.layer.name)
            .forEach( roofLayer => {
                if(roofLayer.alpha === 1){
                    bullet.destroy();
                    // console.log('roof display, hide bullet')
                }   
                else{
                    // console.log('roof not display, show bullet');
                }
            })

        // console.log('hit with other layer, tile:', tile);
        // bullet.destroy();
    }

    setRoofDisplay(obj1, obj2){

        const player = (obj1.constructor.name === 'Player')? obj1: obj2;
        this.roofLayers.forEach( roofLayer => {
            const tile = roofLayer.getTileAtWorldXY(player.x, player.y);
            if (tile){
                roofLayer.alpha = 0;
            }
            else {
                roofLayer.alpha = 1;
            }

            Array.from(this.zombies.children.entries).forEach( zombie => {
                // z
                const zombieTile = roofLayer.getTileAtWorldXY(zombie.x, zombie.y);
                if (zombieTile ){
                    if(!tile){
                        zombie.setVisible(false);
                    }
                    else {
                        zombie.setVisible(true);
                    }
                }
                else{
                    zombie.setVisible(true);
                }
            });
            this.otherPlayers.children.entries.forEach( op => {
                const opTile = roofLayer.getTileAtWorldXY(op.x, op.y);
                if (opTile ){
                    if(!tile){
                        op.setVisible(false);
                    }
                    else {
                        op.setVisible(true);
                    }
                }
                else{
                    op.setVisible(true);
                }
            })
        });
    }
    update(delta) {
        this.mouseAction = {
            x: this.input.mousePointer.x + this.cameras.main.scrollX,
            y: this.input.mousePointer.y + this.cameras.main.scrollY,   
            click: this.input.mousePointer.isDown,
        }
        
        if (this.player)
            this.player.update(this.keys, this.mouseAction, delta);
        
        let bulletsInfo = [];
        Array.from(this.bullets.children.entries).forEach( bullet => {
            bullet.update(delta);
            bulletsInfo.push({x:bullet.x, y: bullet.y, rotation: bullet.rotation, pid: bullet.pid});
        });
        // send bullet info to all after update
        // Object.keys(this.myConn.connections).forEach(k => {
        //     this.myConn.connections[k][0].send(msgpack.encode({action:'updateBullets', data: bulletsInfo}));
        // })
        
        Array.from(this.zombies.children.entries).forEach( zombie => zombie.update(delta));

        // this.zombie.update(delta)

        this.updateText();
    }

    updateText (){
        const msgPlayer  = (this.player)? 'x:' + Math.floor(this.player.x) + ' y:' + parseInt(this.player.y,10): '';
        this.text.setText( msgPlayer );
        // this.text.setText('x:' + Math.floor(this.player.x) + ' y:' + parseInt(this.player.y,10) + '\n Enemy: x:' + Math.floor(this.zombie.x) + ' y:' + parseInt(this.zombie.y,10));
    }
}
export default GameScene;