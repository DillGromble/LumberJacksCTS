var LumberJacksCTS = LumberJacksCTS || {}

LumberJacksCTS.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '')

LumberJacksCTS.game.state.add('Boot', LumberJacksCTS.Boot)
LumberJacksCTS.game.state.add('Preload', LumberJacksCTS.Preload)
LumberJacksCTS.game.state.add('MainMenu', LumberJacksCTS.MainMenu)
//LumberJacksCTS.game.state.add('Game', LumberJacksCTS.Game)

LumberJacksCTS.game.state.start('Boot')
