var game = new Phaser.Game(896, 640,
                          Phaser.AUTO,
                          '',
                          { preload: preload, create: create, update: update });

function preload() {

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
}

var NO_OF_LIVES = 3;
var MAX_MOB_SPEED = 100;
var BLOCKER_ALPHA = 0;
var TIME_REM = 30;
var HEART_OFFSET = 16;
var HURT_TIMER = 60;

var map,
    layer,
    layer1,
    player,
    //boss,
    enemies,
    starbox,
    endbox,
    bgScroll,
    scoreText,
    starCountText,
    starCount = 0,
    score = 0,
    maxScore = 0,
    timer = 0,
    t = 0,
    maxR = 10;
    timeToDeath = HURT_TIMER;
    livesCount = NO_OF_LIVES;


function create() {
  //bg
  bgScroll = game.add.tileSprite(0, 0, 3000, 1600, 'bg_scroll');

  //set physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.stage.backgroundColor = '#edd9fc';
  map = game.add.tilemap('main_map_j');
  map.addTilesetImage('main_ts','tiles');
  layer = map.createLayer('Background');
  layer.resizeWorld();
  //layer.debug = true;
  map.setCollisionBetween(0, 30);

  //stars/manifestos from layer
  stars = game.add.group();
  stars.enableBody = true;
  map.createFromObjects('ObjectsFirst', 51, 'star', 0, true, false, stars);

  //create and set all enimes based on object layer
  enemies = game.add.group();
  enemies.enableBody = true;
  map.createFromObjects('BaddiesLayer', 52, 'baddie', 0, true, true, enemies);
  enemies.callAll('animations.add', 'animations', 'left', [0, 1], 10, true);
  enemies.callAll('animations.add', 'animations', 'right', [2, 3], 10, true);
  enemies.callAll('body.collideWorldBounds', true);
  enemies.callAll('animations.play', 'animations', 'right');
  for (i = 0; i < enemies.children.length; i++){
    enemies.children[i].body.bounce.y = 0.2;
    enemies.children[i].body.gravity.y = 1000;
    enemies.children[i].body.velocity.x = MAX_MOB_SPEED;
  }

  //create blockers - these control ememy movement
  blockers = game.add.group();
  blockers.enableBody = true;
  map.createFromObjects('Blockers', 45, 'blocker', 0, true, false, blockers);
  for (i = 0; i < blockers.children.length; i++){
    blockers.children[i].alpha = BLOCKER_ALPHA;
  }

  //arrow
  blocker = blockers.create(610,380,'downarrow');

  player = game.add.sprite(32, game.world.height - 250, 'dude');
  starbox = game.add.sprite(625, 200, 'starbox');
  endbox = game.add.sprite(1530, 800, 'endbox');
  //boss = game.add.sprite(150,600, 'boss');

  //creates hearts for lives
  lives = game.add.group();
  lives.enableBody = true;
  for (i = 0; i < NO_OF_LIVES; i++){
    live = lives.create(player.x,player.y,'heart');
  }


  //we need to enable physics on the player and baddie
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(enemies);
  game.physics.arcade.enable(starbox);
  //game.physics.arcade.enable(boss);
  game.physics.arcade.enable(endbox);

  //player, baddie and starbox creation
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  starbox.body.bounce.y = 0.2;
  starbox.body.gravity.y = 1000;
  starbox.body.collideWorldBounds = true;

  endbox.body.bounce.y = 0.2;
  endbox.body.gravity.y = 1000;
  endbox.body.collideWorldBounds = true;

  // boss.body.bounce.y = .1;
  // boss.body.bounce.x = .1;
  // boss.body.gravity.y = 0;
  // boss.body.collideWorldBounds = true;
  // //17 18 left  // 19, 20 right
  // boss.animations.add('left', [17,18], 10, true);
  // boss.animations.add('right', [19,20], 10, true);

  //set player and baddie animations
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  //sets cursor keys
  cursors = game.input.keyboard.createCursorKeys();
  game.camera.follow(player);
  game.time.events.add(Phaser.Timer.SECOND * TIME_REM, timerEnd);

  //various game text
  scoreText = game.add.text(game.world.width, 0, 'Score: 0', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
  starCountText = game.add.text(16 , game.world.height - 64, 'Manifestos:', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
  game.add.text(16, game.world.height - 32, 'Find the end and collect stuff', { font: 'Courier',fontSize: '18px', fill: '#fff'});
  game.add.text(565, 490, 'If you have time!', { font: 'Courier',fontSize: '14px', fill: '#000'});
  game.add.text(350, 648, 'Watch out for enemies', { font: 'Courier',fontSize: '14px', fill: '#000'});
  timer = game.add.text(0, 0, 'Timer: 60', { font: 'Courier',fontSize: '24px', fill: '#fff', backgroundColor: '#773682'});
  starCount = stars.length;

  //line between player and end DEBUG
  //toEndLine = new Phaser.Line(player.x, player.y, endbox.x, endbox.y);
}

function update(){

  //check if boxx has got to end and do thing
  //game.physics.arcade.overlap(boss, endbox, bossEnd, null, this);

  if (maxScore < 1){
    scoreText.text = 'Score: ' + score;
  }

  starCountText.text = 'Manifestos: ' + starCount;
  timer.text = Math.floor(game.time.events.duration/1000);
  starCountText.x = game.camera.x + 16;
  starCountText.y = game.camera.y + 580;
  scoreText.x = game.camera.x + 765;
  scoreText.y = game.camera.y + 580;
  timer.x = player.x;
  timer.y = player.y - 100;

  //various collisions checks
  game.physics.arcade.collide(enemies, layer);
  game.physics.arcade.collide(stars, layer);
  game.physics.arcade.collide(starbox, layer);
  game.physics.arcade.collide(endbox, layer);
  //game.physics.arcade.collide(boss, layer);
  //game.physics.arcade.collide(boss, player);
  game.physics.arcade.overlap(player, stars, collectStar, null, this);
  game.physics.arcade.overlap(player, endbox, normalTime, null, this);

  //check all baddie collisions
  for (i = 0; i < enemies.children.length; i ++){
    game.physics.arcade.overlap(player, enemies.children[i], hitBad, null, this);
  }

  game.physics.arcade.overlap(player, starbox, starGen, null, this);
  //variable used to run with keyboard controls
  var hitPlatform = game.physics.arcade.collide(player, layer);

  //reset tint if hit platform
  if (hitPlatform){
    player.tint = 0xFFFFFF;
  }

  //reset the players velocity (movement)
  player.body.velocity.x = 0;

  //check if overlapping blocker, if so change dir and animation
  for (i = 0; i < enemies.children.length; i ++){
    var hitBlocker = game.physics.arcade.overlap(enemies.children[i], blockers);
    if (hitBlocker){
      enemies.children[i].body.velocity.x  *= -1;
      //swaps animation based on velocity
      if (enemies.children[i].body.velocity.x < 0){
        enemies.children[i].animations.play('left');
      } else {
        enemies.children[i].animations.play('right');
      }
    }
  }

  //various movement
  if (cursors.left.isDown){
    //Move to the left
    player.body.velocity.x = -225;
    player.animations.play('left');
    bgScroll.tilePosition.x += 0.15;
  } else if (cursors.right.isDown){
    //Move to the right
    player.body.velocity.x = 225;
    player.animations.play('right');
    bgScroll.tilePosition.x -= 0.15;
  } else{
    player.animations.stop();
    player.frame = 4;
  }

  //if down and hitPlatform allow jump
  if (cursors.up.isDown && hitPlatform){
    player.body.velocity.y = -325;
  }

  //boss distance to player
  // if (game.physics.arcade.distanceBetween(player, boss) < 250){
  //   console.log('They close!');
  //   boss.body.velocity.y += game.rnd.integerInRange(0.5,1);
  // }
  //boss movement
  //boss.body.velocity.x += game.rnd.integerInRange(-5,5);
  //boss.body.velocity.y += game.rnd.integerInRange(-5,5);
  // if (boss.body.velocity.x > 2){
  //   boss.animations.play('right')
  // } else {
  //   boss.animations.play('left');
  // }
  //console.log(perlinNoise(r, t));

  //lives count and control
  for (i = 0; i < livesCount; i++){
    lives.children[i].x = player.x + (HEART_OFFSET*2) + (i*HEART_OFFSET);
    lives.children[i].y = player.y;
  }
  //update last lives alpha based on timeToDeath and convert to decimal
  lives.children[livesCount-1].alpha = ((100/HURT_TIMER) * timeToDeath) / 100;

  if (timeToDeath == 0){
    //reset player
    playerDied(player);
    timeToDeath = HURT_TIMER;
  }

  if (livesCount == 0){
    game.time.slowMotion = 4;
    timerEnd();
  }

  //DEBUG STUFF
  //toEndLine.setTo(boss.x, boss.y, endbox.x, endbox.y, false);
  //game.debug.geom(toEndLine);
  //game.debug.lineInfo(toEndLine, 32, 32);
}

function collectStar (player, star) {
  //removes the star from the screen, increases score etc
  star.kill();
  starCount--;
  score += 10;
  console.log('collected');
}

function hitBad (player, baddie) {
  //displace player based on baddie position with max flex from x,y
  displacement(baddie.x, baddie.y, 26, 26);
}

function starGen (player, starbox) {
  //generates stars in random locations, but not too low
  var rx = Math.random() * game.world.width;
  var ry = Math.random() * game.world.height;
  var star = stars.create(rx, ry - 150, 'star');
  star.body.gravity.y = 50;
  star.body.bounce.y = 0.9;
  star.z = 2;
  starCount++;
}

function displacement (x, y, xlimit, ylimit){
  //displaces player based on some random values to limit, teleports player to x, y
  var nx = Math.random() * xlimit;
  var ny = Math.random() * ylimit;
  player.tint = 0xff0000;
  player.x = x + nx;
  player.y = y - ny;
  score -= 1;
  timeToDeath -=1;
}

function timerEnd(){
  alert("You ran out of time, soz!");
  maxScore = score;
  game.paused = true;
}

function bossEnd(){
  game.time.slowMotion = 3;
  game.time.events.add(Phaser.Timer.SECOND * 3, normalTime);
}

function normalTime(){
  game.paused = true;
  alert('Level complete, your score is ' + score);
}

function playerDied(player,enemy){
   player.kill();
   player.reset(32, game.world.height - 250);
   livesCount --;
}
