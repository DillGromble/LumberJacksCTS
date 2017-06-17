/* global game Client RemotePlayer */

var collisions
var lastXY = []

var playState = {

  player: null,
  started: false,
  layer: null,

  initMap: function () {
    var self = this
    // set map to tileset from load
    var map = game.add.tilemap('level')
    self.map = map
    // tell map which images to source for tilemap indexes
    map.addTilesetImage('LumberTiles', 'tiles')
    // set tile at index 1125 to collision
    map.setCollision(1125)
    // create set layers of tilemap to the map, collision layer invisible
    self.layer = map.createLayer('Ground')
    let obstacles = map.createLayer('Obstacles')
    self.layer = obstacles
    game.world.bringToTop(obstacles)
    collisions = map.createLayer('Meta')
    collisions.visible = false;
    self.layer = collisions
    map.setCollisionBetween(1124, 1126, true, collisions)
  },


  initSelf: function () {
    var self = this

    self.player = game.add.sprite(200, 200, 'characters')

    self.player.anchor.setTo(0.5, 1)
    self.player.scale.setTo(1, 1)

    self.player.animations.add('wait', [4, 10, 16, 22], 3)
    self.player.animations.add('down', [0, 1, 2, 3], 5)
    self.player.animations.add('up', [6, 7, 8, 9], 5)
    self.player.animations.add('right', [12, 13, 14, 15], 5)
    self.player.animations.add('left', [18, 19, 20, 21], 5)

    game.physics.enable(self.player, Phaser.Physics.ARCADE)

    self.pythInverse = 1 / Math.SQRT2
  },

  playerById: function (id) {
    for (let other in game.playerMap) {
      if (game.playerMap.hasOwnProperty(other)) {
        if (game.playerMap[other].player.id === id) return game.playerMap[other].player
      }
    }
    return false
  },

  create: function () {
    var self = this

    game.stage.disableVisibilityChange = true
    game.playerMap = {}

    game.renderPlayer = function (data) {
      let player = self.playerById(data.id)
      player.x = data.x
      player.y = data.y
    }

    game.addNewPlayer = function (id, x, y) {
      game.playerMap[id] = new RemotePlayer(id, game, self.player, x, y)
    }

    Client.askNewPlayer()

    self.initMap()
    self.initSelf()
  },

  update: function () {
    var self = this
    var cursors =  game.input.keyboard.createCursorKeys()

    // if (Object.keys(game.playerMap).length === 4) {
    //   self.started = true
    //   console.log('START!')
    // }

    for (let other in game.playerMap) {
      if (game.playerMap.hasOwnProperty(other)) {
        game.playerMap[other].update()
        game.physics.arcade.collide(self.player, game.playerMap[other].player)
      }
    }

    game.physics.arcade.collide(self.player, self.layer)

    self.player.animations.play('wait')

    if (cursors.left.isDown) {
      self.player.body.velocity.x = -1
      self.player.animations.play('left')
    }
    else if (cursors.right.isDown) {
      self.player.body.velocity.x = 1
      self.player.animations.play('right')
    }
    else {
      self.player.body.velocity.x = 0
    }

    if (cursors.up.isDown) {
      self.player.body.velocity.y = -1
      self.player.animations.play('up')
    }
    else if (cursors.down.isDown) {
      self.player.body.velocity.y = 1
      self.player.animations.play('down')
    }
    else {
      self.player.body.velocity.y = 0
    }

    let targetSpeed =
      (self.player.body.velocity.x !== 0 && self.player.body.velocity.y !== 0)
        ? 200 * self.pythInverse
        : 200

    self.player.body.velocity.x *= targetSpeed
    self.player.body.velocity.y *= targetSpeed

    if (lastXY[0] !== self.player.body.x || lastXY[1] !== self.player.body.y) {
      Client.move(self.player.body.x, self.player.body.y)
    }

    lastXY = [self.player.body.x, self.player.body.y]
  }
}
