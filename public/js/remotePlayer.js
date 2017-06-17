/* global Phaser */

var RemotePlayer = function (index, game, player, startX, startY) {
  const x = startX
  const y = startY

  this.game = game
  this.player = player

  this.player = game.add.sprite(x, y, 'characters')

  this.player.animations.add('wait', [4, 10, 16, 22], 3)
  this.player.animations.add('down', [0, 1, 2, 3], 5)
  this.player.animations.add('up', [6, 7, 8, 9], 5)
  this.player.animations.add('right', [12, 13, 14, 15], 5)
  this.player.animations.add('left', [18, 19, 20, 21], 5)

  this.player.anchor.setTo(0.5, 0.5)

  this.player.id = index

  game.physics.enable(this.player, Phaser.Physics.ARCADE)
  this.player.body.immovable = true
  this.player.body.collideWorldBounds = true

  this.lastPosition = { x: x, y: y }
}

RemotePlayer.prototype.update = function () {
  if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
    if (this.player.x < this.lastPosition.x) this.player.play('left')
    else if (this.player.x > this.lastPosition.x) this.player.play('right')

    if (this.player.y < this.lastPosition.y) this.player.play('up')
    else if (this.player.y > this.lastPosition.y) this.player.play('down')
  }
  else {
    this.player.play('wait')
  }

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}
