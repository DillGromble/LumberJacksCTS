/* global game Client RemotePlayer Phaser */

var lastXY = []


var playState = {

  player: null,
  started: false,
  layer: null,
  hasSeedId: null,
  pythInverse: 1 / Math.SQRT2,

  initMap: function () {
    var self = this

    // set map to tileset from load
    var map = game.add.tilemap('level')

    // tell map which images to source for tilemap indexes
    map.addTilesetImage('LumberTiles', 'tiles')

    // create set layers of tilemap to the map, collision layer invisible
    map.createLayer('Ground')
    map.createLayer('Obstacles')
    let collisions = map.createLayer('Meta')
    collisions.visible = false
    self.layer = collisions

    map.setCollision(1125, true, collisions)
    map.setTileIndexCallback([970, 1078], self.scoreZone, this, collisions)

    self.map = map
  },


  initSelf: function () {
    var self = this

    self.player = game.add.sprite(game.startX, game.startY, 'characters')

    self.player.animations.add('wait', [4, 10, 16, 22], 3)
    self.player.animations.add('down', [0, 1, 2, 3], 5)
    self.player.animations.add('up', [6, 7, 8, 9], 5)
    self.player.animations.add('right', [12, 13, 14, 15], 5)
    self.player.animations.add('left', [18, 19, 20, 21], 5)

    game.physics.enable(self.player, Phaser.Physics.ARCADE)
    self.player.body.immovable = true
    self.player.body.collideWorldBounds = true
    self.player.timeSinceThrowOrTake = 0
    self.player.hasSeed = false

  },

  playerById: function (id) {
    for (let other in game.playerMap) {
      if (game.playerMap.hasOwnProperty(other)) {
        if (game.playerMap[other].player.id === id) return game.playerMap[other].player
      }
    }
    return false
  },

  scoreZone: function (sprite, tile) {
    if (sprite.data.isSeed) {
      if (tile.index === 970) Client.sendScoreRed()
      else Client.sendScoreBlue()
    }
  },

  buildSeed: function (x=10, y=10) {
    let newSeed = game.add.sprite(x, y, 'seed')

    newSeed.data.isSeed = true

    newSeed.scale.setTo(0.15, 0.15)
    newSeed.anchor.setTo(0.5, 0.5)
    game.physics.enable(newSeed, Phaser.Physics.ARCADE)
    newSeed.body.immovable = true
    newSeed.body.collideWorldBounds = true
    newSeed.body.bounce.set(1)

    return newSeed
  },

  create: function () {
    var self = this
    Client.enterGame()
    game.stage.disableVisibilityChange = true
    game.playerMap = {}

    game.hasStarted = true

    self.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
    self.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
    self.up = game.input.keyboard.addKey(Phaser.Keyboard.UP)
    self.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
    self.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    game.input.keyboard.addKeyCapture(
      [ Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN,
        Phaser.Keyboard.SPACEBAR
      ])

    game.addNewPlayer = function (id, x, y) {
      game.playerMap[id] = new RemotePlayer(id, game, self.player, x, y)
    }

    game.renderPlayer = function (data) {
      let player = self.playerById(data.id)
      player.x = data.x
      player.y = data.y
    }

    game.removePlayer = function (data) {
      const removedPlayer = self.playerById(data.id)
      removedPlayer.destroy()
      delete game.playerMap[data.id]
    }

    game.seedExchange = function (id) {
      const playerWithSeed = id ? self.playerById(id) : self.player
      const playerLostSeed = self.hasSeedId ? self.playerById(self.hasSeedId) : self.player

      playerLostSeed.hasSeed = false
      playerLostSeed.timeSinceThrowOrTake = 50
      playerWithSeed.hasSeed = true
      self.goldenSeed.destroy()
      self.goldenSeed = self.buildSeed()
      playerWithSeed.addChild(self.goldenSeed)
      self.hasSeedId = id
    }

    game.throwSeed = function (axis, direction, ox, oy) {
      self.goldenSeed.destroy()
      self.goldenSeed = self.buildSeed(ox, oy)
      if (axis.includes('x')) self.goldenSeed.body.velocity.x = 450 * direction.x
      if (axis.includes('y')) self.goldenSeed.body.velocity.y = 450 * direction.y
    }

    game.updateMap = function (team, oldTile, newTile) {
      if (team === 'red') self.map.replace(oldTile, newTile, 0, 17, 11, 7, 'Obstacles')
      if (team === 'blue') self.map.replace(oldTile, newTile, 21, 0, 11, 7, 'Obstacles')
    }

    game.Over = function (team) {
      game.winner = team
      game.state.start('gameOver')
    }

    self.initMap()
    self.initSelf()

    self.goldenSeed = self.buildSeed(490, 335)
  },

  update: function () {
    var self = this
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

    game.physics.arcade.collide(self.goldenSeed, self.layer)

    game.physics.arcade.collide(self.player, self.layer)

    game.physics.arcade.collide(self.player, self.goldenSeed, () => {
      if (!self.player.hasSeed && self.player.timeSinceThrowOrTake <= 0) {
        self.player.timeSinceThrowOrTake = 100
        Client.takeSeed()
        game.seedExchange()
      }
    })

    self.player.animations.play('wait')

// player movement
    if (self.left.isDown) {
      self.player.body.velocity.x = -1
      self.player.animations.play('left')
    }
    else if (self.right.isDown) {
      self.player.body.velocity.x = 1
      self.player.animations.play('right')
    }
    else {
      self.player.body.velocity.x = 0
    }

    if (self.up.isDown) {
      self.player.body.velocity.y = -1
      self.player.animations.play('up')
    }
    else if (self.down.isDown) {
      self.player.body.velocity.y = 1
      self.player.animations.play('down')
    }
    else {
      self.player.body.velocity.y = 0
    }

// seed throw
    if (self.space.isDown) {
      console.log(self.player.body.x, self.player.body.y)
      if (self.player.hasSeed) {
        self.player.timeSinceThrowOrTake = 50

        let clientPackage = {
          axis: '',
          direction: { x: 0, y: 0 },
          ox: self.player.body.x,
          oy: self.player.body.y
        }

        self.goldenSeed.destroy()
        self.goldenSeed = self.buildSeed(self.player.body.x, self.player.body.y)

        if (self.right.isDown) {
          clientPackage.axis += 'x'
          clientPackage.direction.x = 1
          self.goldenSeed.body.velocity.x = 450
        }
        else if (self.left.isDown) {
          clientPackage.axis += 'x'
          clientPackage.direction.x = -1
          self.goldenSeed.body.velocity.x = -450
        }

        if (self.up.isDown) {
          clientPackage.axis += 'y'
          clientPackage.direction.y = -1
          self.goldenSeed.body.velocity.y = -450
        }
        else if (self.down.isDown) {
          clientPackage.axis += 'y'
          clientPackage.direction.y = 1
          self.goldenSeed.body.velocity.y = 450
        }

        Client.throwSeed(clientPackage)
        self.player.hasSeed = false
      }
    }

// seed deceleration
    if (self.goldenSeed.body.velocity.x > 0) {
      self.goldenSeed.body.velocity.x -= 4
    }
    else if (self.goldenSeed.body.velocity.x < 0) {
      self.goldenSeed.body.velocity.x += 4
    }

    if (self.goldenSeed.body.velocity.y > 0) {
      self.goldenSeed.body.velocity.y -= 4
    }
    else if (self.goldenSeed.body.velocity.y < 0) {
      self.goldenSeed.body.velocity.y += 4
    }

    if (self.player.timeSinceThrowOrTake > 0) self.player.timeSinceThrowOrTake -= 1

// handle player speed in diagonal
    let targetSpeed =
      (self.player.body.velocity.x !== 0 && self.player.body.velocity.y !== 0)
        ? 200 * self.pythInverse
        : 200

    self.player.body.velocity.x *= targetSpeed
    self.player.body.velocity.y *= targetSpeed


// socket emit move event
    if (lastXY[0] !== self.player.body.x || lastXY[1] !== self.player.body.y) {
      Client.move(self.player.body.x, self.player.body.y)
    }

    lastXY = [self.player.body.x, self.player.body.y]
  }
}
