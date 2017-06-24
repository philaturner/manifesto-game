var menuStatus;
var menuStart;
var menuHigh;
var promoText;
var statusText = '.spawn and collect manifestos.';
var startText = '.start.';
var initials = 'aaa';
var init =[];
var highText = [];
var addIntsruct;
var nameChange = true;
var gotFirstData = false;
var HIGH_SCORE_LIMIT = 5;

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

    menuHigh = game.add.text(game.world.centerX-30, game.world.centerY +80, '.highscores.', { font: 'Courier',fontSize: '18px', fill: '#3a4a4a', align: 'center'});
    menuHigh.anchor.set(0.5,0.5);

    promoText = game.add.text(game.world.centerX +125, game.world.centerY +111, '<-- wins a free lunch', { font: 'Courier',fontSize: '14px', fill: '#7a7a7a', align: 'center'});
    promoText.anchor.set(0.5,0.5);

  },

  create: function(){
    //load data and highscores from Firebase
    var ref = database.ref("scores");
    ref.on("value", this.gotData, this.errData);
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
  },

  gotData: function(data){
    highScores = [];
    var tempScores = data.val();

    // Grab the keys to iterate over the object
    var keys = Object.keys(tempScores);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var name = tempScores[key].name;
      var score = tempScores[key].score;
      //console.log(name,score);
      highScores.push([name, score]);
    }
    highScores.sort(compareSecondColumn);

    function compareSecondColumn(a, b) {
      if (a[1] === b[1]) {
        return 0;
      }
      else {
        return (a[1] > b[1]) ? -1 : 1;
      }
    }

    //if exists clear old highscores - prevents display issues
    for (i = 0; i < HIGH_SCORE_LIMIT; i++){
      if (highText[i]){
        highText[i].text = '';
      }
    }

    //draw highScores
    for (i = 0; i < HIGH_SCORE_LIMIT; i++){
      //console.log(highScores[i][0],highScores[i][1]);
      var result = highScores[i][0] + ': ' + highScores[i][1];
      highText[i] = game.add.text(game.world.centerX -80, game.world.centerY +100, result, { font: 'Courier',fontSize: '18px', fill: '#3a4a4a', align: 'center'});
      addIntsruct.anchor.set(0.5,0.5);
      highText[i].hOffset = 100+(i * 22);
      highText[i].y = game.world.centerY + highText[i].hOffset;
      if (i ==0){
        highText[i].fill = '#C7622B';
      }
      if (initials == highScores[i][0]){
        highText[i].fill = '#5bd867';
      }
    }
    gotFirstData = true;
  },

  errData: function(err){
    console.log('You had an error:', err);
  }
};
