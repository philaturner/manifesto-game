var game = new Phaser.Game(896, 640,
                          Phaser.AUTO,
                          '',
                          { preload: preload, create: create, update: update });

var map,
    layer,
    layer1,
    player,
    baddie = [],
    baddie1,
    baddie2,
    baddie3,
    baddie4,
    starbox,
    scoreText,
    starCountText,
    starCount = 0,
    score = 0,
    maxScore = 0;
    timer = 0;

var MAX_MOB_SPEED = 100;
var BLOCKER_ALPHA = 0;
var TIME_REM = 30;

function preload() {

  game.load.image('star', 'assets/manifesto.png');
  game.load.image('starbox', 'assets/manifesto-box.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
  game.load.tilemap('main_map', 'assets/map/level1.csv', null, Phaser.Tilemap.CSV);
  game.load.tilemap('object_layer', 'assets/map/level1_LayerOne.csv', null, Phaser.Tilemap.CSV);
  game.load.image('tiles', 'assets/map/main_tileset.png');
  game.load.image('downarrow', 'assets/downarrow.png');

  //blocker - invisible object that will cause enemies to change direction
  game.load.image('blocker', 'assets/blocker.png');
}

function create() {
  //set physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.stage.backgroundColor = '#edd9fc';
  map = game.add.tilemap('main_map', 32, 32);
  map.addTilesetImage('main_ts','tiles');
  layer = map.createLayer(0);
  layer.resizeWorld();

  map.setCollisionBetween(0, 5);

  //create blockers - these control ememy movement
  blockers = game.add.group();
  blockers.enableBody = true;
  var blocker = blockers.create(420,290, 'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(125,290,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  blocker = blockers.create(330,670,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(515,670,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  blocker = blockers.create(805,816,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(960,816,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  blocker = blockers.create(822,304,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(972,304,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  blocker = blockers.create(1105,592,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(1295,592,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  //arrow
  blocker = blockers.create(610,380,'downarrow');

  //create baddie group
  baddies = game.add.group();

  player = game.add.sprite(32, game.world.height - 150, 'dude');
  starbox = game.add.sprite(625, 200, 'starbox');

  baddie = game.add.sprite(200, 200, 'baddie');
  baddie1 = game.add.sprite(420, 650, 'baddie');
  baddie2 = game.add.sprite(900, 816, 'baddie');
  baddie3 = game.add.sprite(900, 304, 'baddie');
  baddie4 = game.add.sprite(1200, 590, 'baddie');
  baddies.add(baddie);
  baddies.add(baddie1);
  baddies.add(baddie2);
  baddies.add(baddie3);
  baddies.add(baddie4);

  //we need to enable physics on the player and baddie
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(baddies);
  game.physics.arcade.enable(starbox);

  //player, baddie and starbox creation
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  //loop to set properties of all baddies
  for (i = 0; i < baddies.children.length; i++){
    baddies.children[i].body.bounce.y = 0.2;
    baddies.children[i].body.gravity.y = 1000;
    baddies.children[i].body.collideWorldBounds = true;
    baddies.children[i].animations.add('left', [0, 1], 10, true);
    baddies.children[i].animations.add('right', [2, 3], 10, true);
    baddies.children[i].body.velocity.x = MAX_MOB_SPEED;
    baddies.children[i].animations.play('right');
  }

  starbox.body.bounce.y = 0.2;
  starbox.body.gravity.y = 1000;
  starbox.body.collideWorldBounds = true;

  //set player and baddie animations
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  stars = game.add.group();
  stars.enableBody = true;

  //sets cursor keys
  cursors = game.input.keyboard.createCursorKeys();
  game.camera.follow(player);
  game.time.events.add(Phaser.Timer.SECOND * TIME_REM, timerEnd);

  //various game text
  scoreText = game.add.text(game.world.width, 0, 'Score: 0', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
  starCountText = game.add.text(16 , game.world.height - 64, 'Manifestos: 0', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
  game.add.text(16, game.world.height - 32, 'Arrow keys to move, Up to jump. Collect stuff!', { font: 'Courier',fontSize: '18px', fill: '#fff'});
  game.add.text(565, 490, 'Collect them all!', { font: 'Courier',fontSize: '14px', fill: '#000'});
  game.add.text(350, 648, 'Watch out for enemies', { font: 'Courier',fontSize: '14px', fill: '#000'});
  timer = game.add.text(0, 0, 'Timer: 60', { font: 'Courier',fontSize: '24px', fill: '#fff', backgroundColor: '#773682'});
}

function update(){

  //start timer as soon as stars start to spawn
  if (starCount == 1){
    //game.add.text(350, 400, 'Collect all the things...', { font: 'Courier',fontSize: '32px', fill: '#e8336f', backgroundColor: '#fff'});
  }

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
  game.physics.arcade.collide(baddies, layer);
  game.physics.arcade.collide(stars, layer);
  game.physics.arcade.collide(starbox, layer);
  //game.physics.arcade.collide(baddie, stars);  //TODO Pushes stars off screen
  game.physics.arcade.overlap(player, stars, collectStar, null, this);

  //check all baddie collisions
  for (i = 0; i < baddies.children.length; i ++){
    game.physics.arcade.overlap(player, baddies.children[i], hitBad, null, this);
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
  for (i = 0; i < baddies.children.length; i ++){
    var hitBlocker = game.physics.arcade.overlap(baddies.children[i], blockers);
    if (hitBlocker){
      baddies.children[i].body.velocity.x  *= -1;
      //swaps animation based on velocity
      if (baddies.children[i].body.velocity.x < 0){
        baddies.children[i].animations.play('left');
      } else {
        baddies.children[i].animations.play('right');
      }
    }
  }

  if (cursors.left.isDown){
    //Move to the left
    player.body.velocity.x = -225;
    player.animations.play('left');
  } else if (cursors.right.isDown){
    //Move to the right
    player.body.velocity.x = 225;
    player.animations.play('right');
  } else{
    player.animations.stop();
    player.frame = 4;
  }

  //if down and hitPlatform allow jump
  if (cursors.up.isDown && hitPlatform){
    player.body.velocity.y = -325;
  }
}

function collectStar (player, star) {
  //removes the star from the screen, increases score etc
  star.kill();
  starCount--;
  score += 10;
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
}

function timerEnd(){
  alert('Time is up, your score is ' + score);
  maxScore = score;
}
