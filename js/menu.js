var menuStatus;
var menuStart;
var statusText = 'an untitled game';
var startText = '.start.';

var menuState = {

  preload: function(){
    console.log('Menu Screen');
    game.world.bounds.width = 896;
    game.world.bounds.height = 640;

    bgScroll = game.add.tileSprite(0, -700, 3000, 1600, 'bg_scroll');
    //menu label
    game.stage.backgroundColor = '#edd9fc';
    menuStart = game.add.text(game.world.centerX, game.world.centerY -64, '.start.', { font: 'Courier',fontSize: '32pt', fill: '#000', align: 'center'});
    menuStart.anchor.set(0.5,0.5);
    menuStart.inputEnabled = true;
    //start game by clicking
    menuStart.events.onInputOut.add(this.unhighlight, this);
    menuStart.events.onInputOver.add(this.highlight, this);
    menuStart.events.onInputDown.add(this.start, this);

    menuStatus = game.add.text(game.world.centerX, game.world.centerY, '', { font: 'Courier',fontSize: '22px', fill: '#773682', align: 'center'});
    menuStatus.anchor.set(0.5,0.5);
  },

  highlight: function(){
      menuStart.fill = '#fff';
  },

  unhighlight: function(){
      menuStart.fill = '#000';
  },

  start: function(){
    game.state.start('play');
  },

  update: function(){
    menuStatus.position.x = game.world.centerX;
    bgScroll.tilePosition.x += 0.5;
    menuStatus.text = statusText;
    menuStart.text = startText;

  }
};
