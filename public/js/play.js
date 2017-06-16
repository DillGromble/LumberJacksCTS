var collisions

var playState = {

  player: null,
  layer: null,

  initMapAndPlayer: function () {
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
    self.initPlayer()
    let obstacles = map.createLayer('Obstacles')
    self.layer = obstacles

    collisions = map.createLayer('Meta')
    collisions.visible = false;
    self.layer = collisions

    map.setCollisionBetween(1124, 1126, true, collisions)
  },

  initPlayer: function () {
    var self = this

    self.player = game.add.sprite(300, 200, 'characters')

    self.player.frame = 10
    game.add.existing(self.player)
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

  create: function () {
    var self = this

    game.playerMap = {}

    game.addNewPlayer = function (id, x, y) {
      game.playerMap[id] = game.add.sprite(x, y, 'characters')
    }

    Client.askNewPlayer()

    self.initMapAndPlayer()

  },

  update: function () {
    var self = this
    var cursors =  game.input.keyboard.createCursorKeys()

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

  }
}
