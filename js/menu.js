var menuStatus;
var menuStart;
var statusText = '.spawn and collect manifestos.';
var startText = '.start.';
var highScores;
var initials = 'aaa';
var init =[];
var addIntsruct;
var nameChange = true;

var menuState = {

  preload: function(){
    console.log('Menu Screen');
    game.world.bounds.width = 896;
    game.world.bounds.height = 640;

    bgScroll = game.add.tileSprite(0, -700, 3000, 1600, 'bg_scroll');
    //menu label
    game.stage.backgroundColor = '#edd9fc';

    //initials text setup
    var offset = -88;
    for (var i = 0; i < 3; i++){
      offset += 44;
      init[i] = game.add.text(game.world.centerX+offset, game.world.centerY -122, initials[i], { font: 'Courier',fontSize: '48pt', fill: '#C7622B', align: 'center'});
      init[i].anchor.set(0.5,0.5);
      init[i].inputEnabled = true;
      init[i].fIndex = 0; //give the text a propety
      //add events too
      init[i].events.onInputOut.add(this.funhighlight, this);
      init[i].events.onInputOver.add(this.fhighlight, this);
      init[i].events.onInputDown.add(this.scrollLetter, this);
    }

    //menu start text setup
    menuStart = game.add.text(game.world.centerX, game.world.centerY, '.start.', { font: 'Courier',fontSize: '24pt', fill: '#7a7a7a', align: 'center'});
    menuStart.anchor.set(0.5,0.5);
    menuStart.inputEnabled = true;
    //start game by clicking
    menuStart.events.onInputOut.add(this.unhighlight, this);
    menuStart.events.onInputOver.add(this.highlight, this);
    menuStart.events.onInputDown.add(this.start, this);

    menuStatus = game.add.text(game.world.centerX, game.world.centerY -42, '', { font: 'Courier',fontSize: '24pt', fill: '#773682', align: 'center'});
    menuStatus.anchor.set(0.5,0.5);

    addIntsruct = game.add.text(game.world.centerX -160, game.world.centerY -118, 'add your initials --->', { font: 'Courier',fontSize: '14px', fill: '#7a7a7a', align: 'center'});
    addIntsruct.anchor.set(0.5,0.5);
  },

  highlight: function(){
    menuStart.fill = '#fff';
  },

  unhighlight: function(){
    menuStart.fill = '#7a7a7a';
  },

  fhighlight: function(elt){
    elt.fill = '#7a7a7a';
  },

  funhighlight: function(elt){
    elt.fill = '#C7622B';
  },

  scrollLetter: function(elt){
    if(nameChange){
      if (elt.fIndex == 25){
        elt.fIndex = -1;
      }
      elt.fIndex++;
      var char = elt.fIndex + 97;
      elt.text = String.fromCharCode(char);
    }
  },

  start: function(){
    initials = init[0].text + init[1].text + init[2].text;
    console.log(initials);
    if (initials != 'aaa'){
      nameChange = false; //only lock name change when has been changed
    }
    game.state.start('play');
  },

  update: function(){
    menuStatus.position.x = game.world.centerX;
    bgScroll.tilePosition.x += 0.5;
    menuStatus.text = statusText;
    menuStart.text = startText;
    if (!nameChange){
      addIntsruct.text = '';
    }
  }
};
