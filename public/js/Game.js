//game.js

/* global Phaser bootState loadState titleState playState */

var game = new Phaser.Game(1024, 768, Phaser.AUTO, null, 'gameDiv')

//add each game state
game.state.add('boot', bootState)
game.state.add('load', loadState)
game.state.add('title', titleState)
game.state.add('play', playState)

//call boot state
game.state.start('boot')
