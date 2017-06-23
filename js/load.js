var loadState = {

  preload: function(){
    //loading label
    var loadingLabel = game.add.text(350, 648, 'loading....', { font: 'Courier',fontSize: '14px', fill: '#000'});

    //load game assets
    game.load.image('star', 'assets/manifesto.png');
    game.load.image('starbox', 'assets/manifesto-box.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
    //game.load.spritesheet('boss', 'assets/boss-57x88.png', 57, 88);
    game.load.tilemap('main_map_j', 'assets/map/level1JSON.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/map/main_tileset.png', 32, 32);
    game.load.image('downarrow', 'assets/downarrow.png');
    game.load.image('blocker', 'assets/blocker.png');
    game.load.image('bg_scroll', 'assets/scoll-bg.jpg');
    game.load.image('endbox', 'assets/starbox.png');
    game.load.image('heart', 'assets/heart.png');
    console.log('Loaded Assets');
  },

  create: function(){
    game.state.start('menu');
  }

};
