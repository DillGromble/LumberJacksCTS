var LumberJacksCTS = LumberJacksCTS || {}

LumberJacksCTS.Boot = function () {}

LumberJacksCTS.Boot.prototype = {
  preload: function () {
    this.load.image('logo', 'assets/images/logo.png')
    this.load.image('preloadbar', 'assets/images/preloader-bar.png')
  },
  create: function () {
    //loading screen will have white background
    this.game.stage.backgroundColor = '#fff'

    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
    this.scale.minWidth = 240
    this.scale.minHeight = 170
    this.scale.maxWidth = 2880
    this.scale.maxHeight = 1920

    //have game centered horizontally
    this.scale.pageAlignHorizontally = true

    //screen size set automatically
    this.scale.updateLayout(true)

    //physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE)

    this.state.start('Preload')
  }
}
