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
var currentLevel = 'dev';
var currentMedals;
var p;
var bg;

//COLOURS
LIGHT_GREY = '#DCDCDC';
NIGHT_BLUE = '#101F36';
MAIN_ORANGE = '#ff772f';
MAIN_PINK = '#ff6699';

var menuState = {

  preload: function(){
    console.log('Menu Screen');
    game.world.bounds.width = 896;
    game.world.bounds.height = 640;

    bg = game.add.tileSprite(50, 75, 1400, 700, 'menu_scroll');
    //menu label
    game.stage.backgroundColor = NIGHT_BLUE;

    //initials text setup
    var offset = -88;
    for (var i = 0; i < initials.length; i++){
      offset += 44;
      init[i] = game.add.text(game.world.centerX+offset, game.world.centerY -120, initials[i], { font: 'Courier',fontSize: '48pt', fill: MAIN_ORANGE, align: 'center'});
      init[i].anchor.set(0.5,0.5);
      init[i].inputEnabled = true;
      init[i].fIndex = 0; //give the text a propety
      //add events too
      init[i].events.onInputOut.add(this.funhighlight, this);
      init[i].events.onInputOver.add(this.fhighlight, this);
      init[i].events.onInputDown.add(this.scrollLetter, this);
    }

    p = game.add.sprite(game.world.centerX+92, game.world.centerY-125, 'dude');
    p.anchor.set(0.5,0.5);
    p.frame = 4;

    //menu start text setup
    menuStart = game.add.text(game.world.centerX, game.world.centerY, '.start.', { font: 'Courier',fontSize: '24pt', fill: LIGHT_GREY, align: 'center'});
    menuStart.anchor.set(0.5,0.5);
    menuStart.inputEnabled = true;
    //start game by clicking
    menuStart.events.onInputOut.add(this.unhighlight, this);
    menuStart.events.onInputOver.add(this.highlight, this);
    menuStart.events.onInputDown.add(this.start, this);

    menuStatus = game.add.text(game.world.centerX, game.world.centerY -42, '', { font: 'Courier',fontSize: '24pt', fill: MAIN_PINK, align: 'center'});
    menuStatus.anchor.set(0.5,0.5);

    addIntsruct = game.add.text(game.world.centerX -160, game.world.centerY -118, 'add your initials --->', { font: 'Courier',fontSize: '14px', fill: LIGHT_GREY, align: 'center'});
    addIntsruct.anchor.set(0.5,0.5);

    menuHigh = game.add.text(game.world.centerX-150, game.world.centerY +80, '.highscores.', { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
    menuHigh.anchor.set(0.5,0.5);

    menuHigh = game.add.text(game.world.centerX+140, game.world.centerY +80, '.to advance.', { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
    menuHigh.anchor.set(0.5,0.5);

    //promoText = game.add.text(game.world.centerX +165, game.world.centerY +115, '<-- wins a free lunch', { font: 'Courier',fontSize: '14px', fill: LIGHT_GREY, align: 'center'});
    //promoText.anchor.set(0.5,0.5);

  },

  create: function(){
    //load data and highscores from Firebase
    var ref = database.ref(HIGH_SCORE_MODE + "/scores");
    ref.on("value", this.gotData, this.errData);

    //gets game level and sets
    game.currentLevel = currentLevel;
    this.getLevelMedals(game.currentLevel);
    console.log('This levels medals are: G:',currentMedals[0].gold,'S:',currentMedals[0].silver,'B:',currentMedals[0].bronze);

    //add medals for level
    var s = game.add.sprite(game.world.centerX+100, game.world.centerY +100, 'gold');
    s.scale.setTo(0.6);
    var t = game.add.text(s.x+50, s.y+12, currentMedals[0].gold, { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
    t.anchor.set(0.5,0.5);
    var s = game.add.sprite(game.world.centerX+100, game.world.centerY +135, 'silver');
    s.scale.setTo(0.6);
    var t = game.add.text(s.x+50, s.y+12, currentMedals[0].silver, { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
    t.anchor.set(0.5,0.5);
    var s = game.add.sprite(game.world.centerX+100, game.world.centerY +170, 'bronze');
    s.scale.setTo(0.6);
    var t = game.add.text(s.x+50, s.y+12, currentMedals[0].bronze, { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
    t.anchor.set(0.5,0.5);
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
    //move player
    p.frame += 1;
    if (p.frame == 6) p.frame = 3
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
    bg.tilePosition.x += 0.5;
    menuStatus.text = statusText;
    menuStart.text = startText;
    if (!nameChange){
      addIntsruct.text = '';
    }
    if (gotFirstData){
      this.addMedalsToScore(HIGH_SCORE_LIMIT);
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
      highText[i] = game.add.text(game.world.centerX -190, game.world.centerY +100, result, { font: 'Courier',fontSize: '18px', fill: LIGHT_GREY, align: 'center'});
      addIntsruct.anchor.set(0.5,0.5);
      highText[i].hOffset = 100+(i * 22);
      highText[i].y = game.world.centerY + highText[i].hOffset;
      if (i ==0){
        highText[i].fill = MAIN_ORANGE;
      }
      if (initials == highScores[i][0]){
        highText[i].fill = LIGHT_GREY;
      }
    }
    gotFirstData = true;
  },

  errData: function(err){
    console.log('You had an error:', err);
  },

  addMedalsToScore: function(limit){
    for (i=0;i<limit;i++){
      if (highScores[i][1] > currentMedals[0].gold){
        var g = game.add.sprite(highText[i].x - 25, highText[i].y+5, 'gold');
        g.scale.setTo(0.4);
      } else if (highScores[i][1] > currentMedals[0].silver){
          var s = game.add.sprite(highText[i].x - 25, highText[i].y+5, 'silver');
          s.scale.setTo(0.4);
      } else if (highScores[i][1] > currentMedals[0].bronze){
          var b =game.add.sprite(highText[i].x - 25, highText[i].y+5, 'bronze');
          b.scale.setTo(0.4);
      }
    }
  },

  getLevelMedals: function(levelName){
    currentMedals = medalInfo[levelName];
    return medalInfo[levelName]
  }
};
