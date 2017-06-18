/* global game Client RemotePlayer Phaser */

var lastXY = []
var seedIsHeld = false

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

    // create set layers of tilemap to the map, collision layer invisible
    map.createLayer('Ground')
    map.createLayer('Obstacles')
    let collisions = map.createLayer('Meta')
    collisions.visible = false
    self.layer = collisions

    map.setCollision(1125, true, collisions)
    map.setTileIndexCallback([970, 1078], self.scoreZone, this, collisions)
  },


  initSelf: function () {
    var self = this

    self.player = game.add.sprite(200, 200, 'characters')

    self.player.animations.add('wait', [4, 10, 16, 22], 3)
    self.player.animations.add('down', [0, 1, 2, 3], 5)
    self.player.animations.add('up', [6, 7, 8, 9], 5)
    self.player.animations.add('right', [12, 13, 14, 15], 5)
    self.player.animations.add('left', [18, 19, 20, 21], 5)

    self.player.anchor.setTo(0.5, 0.5)

    game.physics.enable(self.player, Phaser.Physics.ARCADE)
    self.player.body.immovable = true
    self.player.body.collideWorldBounds = true

    self.player.hasSeed = false

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

  scoreZone: function (sprite, tile) {
    console.log(sprite.hasSeed)
  },

  buildSeed: function (x=0, y=0) {
    let newSeed = game.add.sprite(x, y, 'seed')

    newSeed.scale.setTo(0.15, 0.15)
    newSeed.anchor.setTo(0.5, 0.5)
    game.physics.enable(newSeed, Phaser.Physics.ARCADE)
    newSeed.body.immovable = true
    newSeed.body.collideWorldBounds = true

    return newSeed
  },

  create: function () {
    var self = this

    game.stage.disableVisibilityChange = true
    game.playerMap = {}

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

    Client.askNewPlayer()

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

    game.physics.arcade.collide(self.player, self.layer, () => {
      console.log('collided')
    })

    game.physics.arcade.collide(self.player, self.goldenSeed, () => {
      if (!seedIsHeld) {
        self.player.hasSeed = true
        self.goldenSeed.destroy()
        self.goldenSeed = self.buildSeed()
        self.player.addChild(self.goldenSeed)
        Client.takeSeed()
      }
      seedIsHeld = true
    })

    self.player.animations.play('wait')

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

    if (self.space.isDown) {
      console.log('SPAAAACE')
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
