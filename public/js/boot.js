//boot.js

/* global game Phaser */

var bootState = {
  create: () => {
    game.physics.startSystem(Phaser.Physics.Arcade)
    game.state.start('load')
  }
}
