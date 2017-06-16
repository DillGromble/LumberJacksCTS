//load.js

var loadState = {
  preload: function () {
    var loadingLabel = game.add.text(80, 150, 'loading...', {font: '30px Courier', fill: '#ffffff'})

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    game.scale.PageAlignHorizonally = true
    game.scale.PageAlignVertically = true
    game.stage.backgroundColor = '#000000'

    /***** Load Graphics Assets *****/
    game.load.spritesheet('characters', 'assets/sprites/log.png', 32, 32)
    game.load.tilemap('level', 'assets/tilemaps/LumberMap.json', null, Phaser.Tilemap.TILED_JSON)
    game.load.image('tiles', 'assets/tilemaps/StackTiles.png')

    /***** Load Audio Assets *****/
  },

  create: function () {
    game.state.start('title')
  }
}
