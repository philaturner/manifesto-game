var game = new Phaser.Game(896, 640,
                          Phaser.AUTO,
                          '',
                          { preload: preload, create: create, update: update });

var map,
    layer,
    player,
    baddie,
    baddie1,
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
  //game.load.image('sky', 'assets/sky.png');
  game.load.image('star', 'assets/star.png');
  //game.load.image('ground', 'assets/platform.png');
  game.load.image('starbox', 'assets/starbox.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
  game.load.tilemap('main_map', 'assets/map/level1.csv', null, Phaser.Tilemap.CSV);
  game.load.image('tiles', 'assets/map/main_tileset.png');

  //blocker - invisible object that will cause enemies to change direction
  game.load.image('blocker', 'assets/blocker.png');
}

function create() {
  //set physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.stage.backgroundColor = '#87CEFA';
  map = game.add.tilemap('main_map', 32, 32);
  map.addTilesetImage('main_ts','tiles');
  layer = map.createLayer(0);
  layer.resizeWorld();
  map.setCollisionBetween(0, 5);

  //adds sky sprint as bg
  //game.add.sprite(0, 0, 'sky');

  //the platforms group contains the ground and the 2 ledges we can jump on
  //platforms = game.add.group();
  //platforms.enableBody = true;


  //var ground = platforms.create(0, game.world.height - 64, 'ground');
  //ground.scale.setTo(2, 2);
  //ground.body.immovable = true;

  //create two ledges
  //var ledge = platforms.create(400, 400, 'ground');
  //ledge.body.immovable = true;
  //ledge = platforms.create(-150, 250, 'ground');
  //ledge.body.immovable = true;

  //create blockers - these control ememy movement
  blockers = game.add.group();
  blockers.enableBody = true;
  var blocker = blockers.create(420,290, 'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(125,290,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(315,670,'blocker');
  blocker.alpha = BLOCKER_ALPHA;
  blocker = blockers.create(520,670,'blocker');
  blocker.alpha = BLOCKER_ALPHA;

  baddies = game.add.group();

  player = game.add.sprite(32, game.world.height - 150, 'dude');
  baddie = game.add.sprite(200, 200, 'baddie');
  starbox = game.add.sprite(625, 200, 'starbox');
  baddie1 = game.add.sprite(420, 650, 'baddie');
  baddies.add(baddie);
  baddies.add(baddie1);

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

  //baddie.body.bounce.y = 0.2;
  //baddie.body.gravity.y = 1000;
  //baddie.body.collideWorldBounds = true;

  starbox.body.bounce.y = 0.2;
  starbox.body.gravity.y = 1000;
  starbox.body.collideWorldBounds = true;

  //set player and baddie animations
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  //OLD baddie properties
  //baddie.animations.add('left', [0, 1], 10, true);
  //baddie.animations.add('right', [2, 3], 10, true);
  //baddie.body.velocity.x = MAX_MOB_SPEED;
  //baddie.animations.play('right');

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
  game.camera.follow(player);

  //various game text
  scoreText = game.add.text(game.world.width, 0, 'Score: 0', { font: 'Courier',fontSize: '18px', fill: '#000'});
  starCountText = game.add.text(16 , game.world.height - 30, 'Stars: 0', { font: 'Courier',fontSize: '18px', fill: '#000'});
  game.add.text(16, game.world.height - 32, 'Arrow keys to move, Up to jump. Now go Explore!', { font: 'Courier',fontSize: '18px', fill: '#fff'});
  game.add.text(565, 490, 'Generate some stars', { font: 'Courier',fontSize: '14px', fill: '#000'});
  game.add.text(350, 648, 'Watch out for enemies', { font: 'Courier',fontSize: '14px', fill: '#000'});
}

function update(){

  //update stars text
  starCountText.text = 'Stars: ' + starCount;
  starCountText.x = game.camera.x + 16;
  starCountText.y = game.camera.y + 16;
  scoreText.x = game.camera.x + 780;
  scoreText.y = game.camera.y + 16;

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
  if (cursors.up.isDown && hitPlatform){
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
