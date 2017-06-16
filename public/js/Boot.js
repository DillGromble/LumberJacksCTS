//boot.js

var bootState = {
  create: function () {

    game.physics.startSystem(Phaser.Physics.Arcade)
    game.state.start('load')

  }
}
