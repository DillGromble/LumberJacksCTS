// title.js

/* global game Client */
var nameLabel

var gameOverState = {
  numConnected: 4,
  canStart: false,

  create: function () {
    nameLabel = game.add.text(game.world.centerX - 95, game.world.centerY, `${game.winner} team wins!`, {
      font: '16px Space Mono', fill: '#ffffff'
    })

    game.input.activePointer.capture = true

  },

  update: function () {
    // if (this.numConnected !== game.numPlayers) game.updateConnected(nameLabel)
    if (game.numPlayers === 4) {
      Client.resetState()
      this.canStart = true
    }

    if (game.input.activePointer.isDown) { // && this.canStart
      game.state.start('play')
    }
  }
}
