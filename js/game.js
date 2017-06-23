var game = new Phaser.Game(896, 640, Phaser.AUTO, 'gameDiv');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);
game.state.add('win', winState);
console.log('Game Initialised');
game.state.start('boot');
