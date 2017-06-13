var game = new Phaser.Game(800, 600,
                          Phaser.AUTO,
                          '',
                          { preload: preload, create: create, update: update });

var player,
    baddie,
    starbox,
    scoreText,
    starCountText,
    starCount = 0,
    score = 0,
    jumpCount = 0;

var MAX_MOB_SPEED = 100;
var BLOCKER_ALPHA = 0;

//TODO Add hidden alpha 0 collision blocks to allow AI to move between points

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('starbox', 'assets/starbox.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

  //blocker - invisible object that will cause enemies to change direction
  game.load.image('blocker', 'assets/blocker.png');
}

function create() {
  //set physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //adds sky sprint as bg
  game.add.sprite(0, 0, 'sky');

  //the platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();
  platforms.enableBody = true;


  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;

  //create two ledges
  var ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;
  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;

  //create blockers
  blockers = game.add.group();
  blockers.enableBody = true;
  var blocker = blockers.create(245,220, 'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(-30,220,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  starbox = game.add.sprite(game.world.width - 45, 0, 'starbox');
  player = game.add.sprite(32, game.world.height - 150, 'dude');
  baddie = game.add.sprite(90, 10, 'baddie');

  //we need to enable physics on the player and baddie
  game.physics.arcade.enable(player);
  game.physics.arcade.enable(baddie);
  game.physics.arcade.enable(starbox);

  //player, baddie and starbox creation
  player.body.bounce.y = 0.2;
  player.body.gravity.y = 300;
  player.body.collideWorldBounds = true;

  baddie.body.bounce.y = 0.2;
  baddie.body.gravity.y = 1000;
  baddie.body.collideWorldBounds = true;

  starbox.body.bounce.y = 0.2;
  starbox.body.gravity.y = 1000;
  starbox.body.collideWorldBounds = true;

  //set player and baddie animations
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  baddie.animations.add('left', [0, 1], 10, true);
  baddie.animations.add('right', [2, 3], 10, true);

  baddie.body.velocity.x = MAX_MOB_SPEED;
  baddie.animations.play('right');
  //baddie.body.dir = 'right';

  stars = game.add.group();
  stars.enableBody = true;

  //OLD tars creations
  // for (var i = 0; i < 1; i++){
  //   for (var j = 0; j < 1; j++){
  //     var rx = Math.random() * game.world.width;
  //     var ry = Math.random() * game.world.height;
  //     var star = stars.create(rx, ry - 150, 'star');
  //     star.body.gravity.y = 50;
  //     //star.body.bounce.y = 0.7 + Math.random() * 0.2;
  //     star.body.bounce.y = 0.9;
  //     star.z = 2;
  //   }
  // }
  //sets cursor keys
  cursors = game.input.keyboard.createCursorKeys();

  //various game text
  scoreText = game.add.text(game.world.width - 110, game.world.height - 30, 'Score: 0', { font: 'Courier',fontSize: '18px', fill: '#fff'});
  starCountText = game.add.text(16 , game.world.height - 30, 'Stars: 0', { font: 'Courier',fontSize: '18px', fill: '#fff'});
  game.add.text(200, 16, 'Arrow keys to move, Up to jump.', { font: 'Courier',fontSize: '22px', fill: '#fff'});
  game.add.text(630, 345, 'Generate some stars', { font: 'Courier',fontSize: '14px', fill: '#fff'});
  game.add.text(38, 200, 'Watch out for enemies', { font: 'Courier',fontSize: '14px', fill: '#fff'});
}

function update(){

  //update stars text
  starCountText.text = 'Stars: ' + starCount;

  //various collisions checks
  game.physics.arcade.collide(baddie, platforms);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.collide(starbox, platforms);
  //game.physics.arcade.collide(baddie, stars);  //TODO Pushes stars off screen
  game.physics.arcade.overlap(player, stars, collectStar, null, this);
  game.physics.arcade.overlap(player, baddie, hitBad, null, this);
  game.physics.arcade.overlap(player, starbox, starGen, null, this);
  //variable used to run with keyboard controls
  var hitPlatform = game.physics.arcade.collide(player, platforms);

  //reset tint if hit platform
  if (hitPlatform){
    player.tint = 0xFFFFFF;
  }

  //reset the players velocity (movement)
  player.body.velocity.x = 0;

  //check if overlapping blocker, if so change dir and animation
  var hitBlocker = game.physics.arcade.overlap(baddie, blockers);
  if (hitBlocker){
    baddie.body.velocity.x  *= -1;
    //swaps animation based on velocity
    if (baddie.body.velocity.x < 0){
      baddie.animations.play('left');
    } else {
      baddie.animations.play('right');
    }
  }

  if (cursors.left.isDown){
    //Move to the left
    player.body.velocity.x = -150;
    player.animations.play('left');
  } else if (cursors.right.isDown){
    //Move to the right
    player.body.velocity.x = 150;
    player.animations.play('right');
  } else{
    player.animations.stop();
    player.frame = 4;
  }

  //if down and hitPlatform allow jump
  if (cursors.up.isDown && player.body.touching.down && hitPlatform){
    player.body.velocity.y = -325;
  }
}

function collectStar (player, star) {
  //removes the star from the screen, increases score etc
  star.kill();
  starCount--;
  score += 10;
  scoreText.text = 'Score: ' + score;
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
}
