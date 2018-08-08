export default function loadImages(scene) {

    var listOfCharacters = {
        type: ['black1', 'black2', 'green1', 'green2', 'blue1', 'blue2', 'yellow', 'zombie', 'armour'],
        action: ['stand', 'walk', 'gun1', 'gun2', 'gun3', 'gun3_run']
    };
    var config;
    var name;
    
    listOfCharacters.type.forEach(name1 => {
        listOfCharacters.action.forEach(name2 => {
            name = name1 + '_' + name2;
            config = {
                key: name,
                frames: [{
                    key: 'tds_characters',
                    frame: name
                }],
            };
            scene.anims.create(config);
        });
    });

    config = {
        key: 'bullets_Blue',
        frames: [{
            key: 'bullets_Blue',
            frame: 'bullets',
        }],
    };
    scene.anims.create(config);

    console.log('anims', scene.anims)
}
