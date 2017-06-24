var NO_OF_LIVES = 3;
var MAX_MOB_SPEED = 100;
var BLOCKER_ALPHA = 0;
var TIME_REM = 30;
var HEART_OFFSET = 16;
var HURT_TIMER = 60;
var SPEED_MULTIPLER = 1.3;

var map,
    layer,
    layer1,
    player,
    enemies,
    starbox,
    endbox,
    bgScroll,
    scoreText,
    starCountText,
    starCount,
    score,
    maxScore,
    timer,
    t,
    maxR;

var playState = {

  create: function(){
    starCount=score=maxScore=timer=t=0;
    maR = 10;
    timeToDeath = HURT_TIMER;
    livesCount = NO_OF_LIVES;
    console.log('Play State');
    //bg
    bgScroll = game.add.tileSprite(0, -500, 3000, 1600, 'bg_scroll');

    map = game.add.tilemap('main_map_j');
    map.addTilesetImage('main_ts','tiles');
    layer = map.createLayer('Background');
    layer.resizeWorld();
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
    endbox = game.add.sprite(1500, 50, 'endbox');
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
    player.body.gravity.y = 750;
    player.body.collideWorldBounds = true;
    player.body.maxVelocity.x = 600;
    player.body.maxVelocity.y = 600;

    starbox.body.bounce.y = 0.2;
    starbox.body.gravity.y = 1000;
    starbox.body.collideWorldBounds = true;

    endbox.body.bounce.y = 0.2;
    endbox.body.gravity.y = 1000;
    endbox.body.collideWorldBounds = true;

    //set player and baddie animations
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //sets cursor keys
    cursors = game.input.keyboard.createCursorKeys();
    game.camera.follow(player);
    game.time.events.add(Phaser.Timer.SECOND * TIME_REM, this.timeIsUp);

    //various game text
    scoreText = game.add.text(game.world.width, 0, 'Score: 0', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
    starCountText = game.add.text(16 , game.world.height - 64, 'Manifestos:', { font: 'Courier',fontSize: '18px', fill: '#fff', backgroundColor: '#7a7a7a'});
    game.add.text(16, game.world.height - 350, '*Find the end and collect*', { font: 'Courier',fontSize: '18px', fill: '#000'});
    game.add.text(565, 490, 'If you have time!', { font: 'Courier',fontSize: '14px', fill: '#000'});
    game.add.text(350, 648, 'Watch out for enemies', { font: 'Courier',fontSize: '14px', fill: '#000'});
    timer = game.add.text(0, 0, 'Timer: 60', { font: 'Courier',fontSize: '24px', fill: '#fff', backgroundColor: '#773682'});
    starCount = stars.length;

  },

  update: function(){

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
    game.physics.arcade.overlap(player, stars, this.collectStars, null, this);
    game.physics.arcade.overlap(player, endbox, this.completedLevel, null, this);

    //check all baddie collisions
    for (i = 0; i < enemies.children.length; i ++){
      game.physics.arcade.overlap(player, enemies.children[i], this.hitEnenmy, null, this);
    }

    game.physics.arcade.overlap(player, starbox, this.generateStars, null, this);
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
      player.body.velocity.y = -500;
    }

    if (cursors.down.isDown && !hitPlatform){
      player.body.velocity.y = 400;
    }

    //spacebar to reset level
    spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    if (spaceBar.isDown){
      game.state.start(game.state.current);
    }

    //lives count and control
    for (i = 0; i < livesCount; i++){
      lives.children[i].x = player.x + (HEART_OFFSET*2) + (i*HEART_OFFSET);
      lives.children[i].y = player.y;
    }
    //update last lives alpha based on timeToDeath and convert to decimal
    lives.children[livesCount-1].alpha = ((100/HURT_TIMER) * timeToDeath) / 100;

    if (timeToDeath == 0){
      //reset player
      this.playerRestart(player);
      timeToDeath = HURT_TIMER;
    }

    if (livesCount == 0){
      score = 0;
      playState.endofLevel("you died :'(", '.try again.');
    }

  },

  endofLevel: function(sText, stText){
    console.log('End of Level');
    statusText = sText;
    startText = stText;
    if (score > 400){
      this.submitScore();
    }
    score = 0;
    game.state.start('menu', true, false);
  },

  collectStars: function(player, star){
    star.kill();
    starCount--;
    score += 10;

    //random chance to get speed boost
    var rnd = game.rnd.integerInRange(1, 10)
    if (rnd > 8){
      player.body.velocity.x *= SPEED_MULTIPLER;
      player.body.velocity.y *= SPEED_MULTIPLER;
    }
  },

  generateStars: function(){
    //generates stars in random locations, but not too low
    var rx = Math.random() * game.world.width;
    var ry = Math.random() * game.world.height;
    var star = stars.create(rx, ry - 150, 'star');
    star.body.gravity.y = 50;
    star.body.bounce.y = 0.9;
    star.z = 2;
    starCount++;
  },

  hitEnenmy: function(player, baddie){
    this.displacement(baddie.x, baddie.y, 100, 50);
  },

  playerRestart: function(){
    player.kill();
    player.reset(32, game.world.height - 250);
    livesCount --;
  },

  displacement: function(x, y, xlimit, ylimit){
    //displaces player based on some random values to limit, teleports player to x, y
    var nx = Math.random() * xlimit;
    var ny = Math.random() * ylimit;
    player.tint = 0xff0000;
    player.x = x - xlimit;
    player.y = y - ylimit;
    player.body.velocity.x = -100;
    player.body.velocity.y = -50;
    score -= 25;
    timeToDeath -=HURT_TIMER/3;
    game.camera.flash(0xff0000, 100);
  },

  timeIsUp: function(string){
    score = 0;
    playState.endofLevel("you ran out of time :'(", '.play again');
  },

  completedLevel: function(){
    playState.endofLevel('level complete, your score was ' + score, '.play again.');
  },

  submitScore: function(){
    console.log('Submitted a score');
    var data = {
      name: initials,//nameInput.value(),
      score: score//score
    }
    var scores = database.ref('scores').push(data);
  }
};
